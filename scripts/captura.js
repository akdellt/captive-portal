const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            const videoElement = document.getElementById('cam');
            videoElement.srcObject = stream;
        })
        .catch(function(err) {
            console.log("Erro ao acessar a câmera: " + err);
        });
};

const loadLabel = async (matricula) => {
    const descriptions = [];
    try {
        const img = await faceapi.fetchImage(`./perfis/${matricula}.jpg`);
        const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detections) {
            return null;
        }

        descriptions.push(detections.descriptor);
        return new faceapi.LabeledFaceDescriptors(matricula, descriptions);
    } catch (error) {
        return null; 
    }
};

const faceAuth = async (matricula) => {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
    ]);

    const label = loadLabel(matricula);
    if (!label) {
        alert("Matrícula ou imagem não existente.");
        return;
    }

    startVideo();

    cam.addEventListener('play', async () => {
        const canvas = faceapi.createCanvasFromMedia(cam);
        const canvasSize = {
            width: cam.width,
            height: cam.height
        };

        faceapi.matchDimensions(canvas, canvasSize);
        document.body.appendChild(canvas);

        const interval = setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(
                    cam, 
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptors();
                
            const resizedDetections = faceapi.resizeResults(detections, canvasSize);
            const faceMatcher = new faceapi.FaceMatcher([label], 0.6);
            
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);

            resizedDetections.forEach(detection => {
                const result = faceMatcher.findBestMatch(detection.descriptor);

                if (result.label !== "unknown") {
                    alert(`Reconhecimento concluído! Bem-vindo, ${result.label}`);
                    clearInterval(interval);
                    cam.style.display = "none";
                    cam.srcObject.getTracks().forEach(track => track.stop());
                    document.body.removeChild(canvas);
                    window.location.href = 'conectado.html';
                } else {
                    alert("Rosto não identificado, verifique informações novamente");
                    clearInterval(interval);
                    cam.style.display = "none";
                    cam.srcObject.getTracks().forEach(track => track.stop());
                    document.body.removeChild(canvas);
                }
            });
        }, 100);
    });
}

