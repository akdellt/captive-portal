const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            const videoElement = document.querySelector('video');
            videoElement.srcObject = stream;
        })
        .catch(function(err) {
            console.log("Erro ao acessar a câmera: " + err);
        });
};

const loadLabels = async () => {
    const response = await fetch("http://localhost:3000");
    const data = await response.json();
    const labels = data.map(item => item.matricula);

    return Promise.all(labels.map(async label => {
        const descriptions = [];
        try {
            const img = await faceapi.fetchImage(`./perfis/${label}.jpg`);
            const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                return null;
            }

            descriptions.push(detections.descriptor);
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        } catch (error) {
            return null; 
        }
    })).then(labels => labels.filter(label => label !== null)); 
};

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(startVideo);

cam.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(cam);
    const canvasSize = {
        width: cam.width,
        height: cam.height
    };

    const labels = await loadLabels();
    faceapi.matchDimensions(canvas, canvasSize);
    document.body.appendChild(canvas);

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(
                cam, 
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptors();
            
        const resizedDetections = faceapi.resizeResults(detections, canvasSize);
        const faceMatcher = new faceapi.FaceMatcher(labels, 0.6);
        
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const result = faceMatcher.findBestMatch(detection.descriptor);

            let labelText = result.label === "unknown" ? "Desconhecido" : `${result.label} (${result.distance.toFixed(2)})`;

            new faceapi.draw.DrawTextField([labelText], box.bottomRight).draw(canvas);
        });
    }, 100);
});
