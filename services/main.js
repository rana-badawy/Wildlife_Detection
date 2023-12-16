let animals = [];
let mlModel = '';
let confidence = '';
let camera = '';
let mediaRecorder;
let chunks = [];
let previousDetection = '';
let time;
let recording = false;
let locations = [{country: 'US', state: 'Iowa', city: 'Fairfield'},
                 {country: 'US', state: 'Illinois', city: 'Chicago'},
                 {country: 'US', state: 'New York', city: 'New York City'},
                 {country: 'US', state: 'Florida', city: 'Jacksonville'}];

navigator.mediaDevices.enumerateDevices().then(function (devices) {
    for(let i = 0; i < devices.length; i++){
        let device = devices[i];
        if (device.kind === 'videoinput') {
            let option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || 'Camera ' + (i + 1);
            document.querySelector('select#videoSource').appendChild(option);
        }
    };
});

$('document').ready(function() {
    let slider = $('#myRange');
    let output = $('#sliderOutput');
    output.html(slider.val() + '%');
});

function getRandomLocation() {
    let i =  parseInt(Math.random() * 4);

    return locations[i];
}

// Update the current slider value (each time you drag the slider handle)
function changeSliderValue() {
    let slider = $('#myRange');
    let output = $('#sliderOutput');
    output.html(slider.val() + '%');
}

function saveFile(file) {
    const formData = new FormData();

    formData.append("file", file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('File uploaded successfully:', data);
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}

function submitForm() {

    for(let a of $('.animal:checked')) {
        animals.push($(a).val());
    }

    mlModel = $('.model option:selected').val();
    confidence = $('.slider').val();
    camera = $('#videoSource option:selected').val();
    
    $('.content').html('<div class="loading"><video id="video" autoplay muted playsinline></video><div id="fps"></div></div>');

    const video = $("video")[0];

    let model;
    let cameraMode = "environment"; // or "user"

    const startVideoStreamPromise = navigator.mediaDevices.getUserMedia({
            audio: false,
            deviceId: camera,
            video: {
                facingMode: cameraMode
            }
        })
        .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);

            return new Promise(function (resolve) {
                video.srcObject = stream;
                video.onloadeddata = function () {
                    video.play();
                    resolve();
                };
            });
        });

    let publishable_key = "rf_UTYIbxdTwVM2JLLp8gaUqfKCZFx1";
    let toLoad = {
        model: "fairfield_wildlife_detector",
        version: 1
    };

    const loadModelPromise = new Promise(function (resolve, reject) {
        roboflow
            .auth({
                publishable_key: publishable_key
            })
            .load(toLoad)
            .then(function (m) {
                model = m;
                resolve();
            });
    });

    Promise.all([startVideoStreamPromise, loadModelPromise]).then(function () {
        $("body").removeClass("loading");
        resizeCanvas();
        detectFrame();
    });

    let canvas, ctx;
    const font = "16px sans-serif";

    function videoDimensions(video) {
        // Ratio of the video's intrisic dimensions
        let videoRatio = video.videoWidth / video.videoHeight;

        // The width and height of the video element
        let width = video.offsetWidth,
            height = video.offsetHeight;

        // The ratio of the element's width to its height
        let elementRatio = width / height;

        // If the video element is short and wide
        if (elementRatio > videoRatio) {
            width = height * videoRatio;
        } else {
            // It must be tall and thin, or exactly equal to the original ratio
            height = width / videoRatio;
        }

        return {
            width: width,
            height: height
        };
    }

    $(window).resize(function () {
        resizeCanvas();
    });

    const resizeCanvas = function () {
        $("canvas").remove();

        canvas = $("<canvas/>");

        // ctx = canvas[0].getContext("2d");

        // let dimensions = videoDimensions(video);

        // console.log(
        //     video.videoWidth,
        //     video.videoHeight,
        //     video.offsetWidth,
        //     video.offsetHeight,
        //     dimensions
        // );

        // canvas[0].width = video.videoWidth;
        // canvas[0].height = video.videoHeight;

        // canvas.css({
        //     width: dimensions.width,
        //     height: dimensions.height,
        //     left: ($(window).width() - dimensions.width) / 2,
        //     top: ($(window).height() - dimensions.height) / 2
        // });

        // $("body").append(canvas);
    };

    const renderPredictions = function (predictions) {
        // let dimensions = videoDimensions(video);

        // let scale = 1;

        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // predictions.forEach(function (prediction) {
        //     const x = prediction.bbox.x;
        //     const y = prediction.bbox.y;

        //     const width = prediction.bbox.width;
        //     const height = prediction.bbox.height;

        //     // Draw the bounding box.
        //     ctx.strokeStyle = prediction.color;
        //     ctx.lineWidth = 4;
        //     ctx.strokeRect(
        //         (x - width / 2) / scale,
        //         (y - height / 2) / scale,
        //         width / scale,
        //         height / scale
        //     );

        //     // Draw the label background.
        //     ctx.fillStyle = prediction.color;
        //     const textWidth = ctx.measureText(prediction.class).width;
        //     const textHeight = parseInt(font, 10); // base 10
        //     ctx.fillRect(
        //         (x - width / 2) / scale,
        //         (y - height / 2) / scale,
        //         textWidth + 8,
        //         textHeight + 4
        //     );
        // });

        // predictions.forEach(function (prediction) {
        //     const x = prediction.bbox.x;
        //     const y = prediction.bbox.y;

        //     const width = prediction.bbox.width;
        //     const height = prediction.bbox.height;
            
        //     // Draw the text last to ensure it's on top.
        //     ctx.font = font;
        //     ctx.textBaseline = "top";
        //     ctx.fillStyle = "#000000";
        //     ctx.fillText(
        //         prediction.class,
        //         (x - width / 2) / scale + 4,
        //         (y - height / 2) / scale + 1
        //     );
        // });

        predictions.forEach(function(prediction) {
            console.log(prediction.class);
            if (prediction.class != previousDetection || Date.now() - time >= 600000) {
                console.log('inside if 1');
                previousDetection = prediction.class;

                let location = getRandomLocation();

                const data = {
                    name: prediction.class,
                    location: location 
                }

                fetch('/insert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success: ', data);
                })
                .catch(error => {
                    console.error('Error: ', error);
                });

                if (animals.includes(prediction.class) && prediction.confidence >= confidence/100) {
                    console.log('inside if 2');
                    time = new Date();

                    if (recording == false) {
                        mediaRecorder.start();
                        recording = true;
                    }

                    setTimeout(function() {
                        mediaRecorder.stop()
                    }, 10000);

                    mediaRecorder.ondataavailable = function(ev) {
                        chunks.push(ev.data);
                    }

                    mediaRecorder.onstop = function(ev) {
                        let blob = new Blob(chunks, {'type': 'video/mp4;'});
                        chunks = [];
                        let fileName = prediction.class + ' ' +
                        time.toLocaleString('en-US').replaceAll('/', '-').replaceAll(':', '-').replace(',', ' ').replace('  ', ' ') + '.mp4';
                        
                        let file = new File([blob], fileName, { type: "video/mp4"} );
                        
                        saveFile(file);
                        
                        recording = false;
                    }
                }
            }
        });
    };

    let prevTime;
    let pastFrameTimes = [];

    const detectFrame = function () {
        if (!model) return requestAnimationFrame(detectFrame);

        model
            .detect(video)
            .then(function (predictions) {
                requestAnimationFrame(detectFrame);
                renderPredictions(predictions);

                if (prevTime) {
                    pastFrameTimes.push(Date.now() - prevTime);
                    if (pastFrameTimes.length > 30) pastFrameTimes.shift();

                    let total = 0;
                    _.each(pastFrameTimes, function (t) {
                        total += t / 1000;
                    });

                    // let fps = pastFrameTimes.length / total;
                    // $("#fps").text(Math.round(fps));
                }
                prevTime = Date.now();
            })
            .catch(function (e) {
                console.log("CAUGHT", e);
                requestAnimationFrame(detectFrame);
            });
    };
}
