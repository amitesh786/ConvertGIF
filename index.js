const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

async function loadFFmpeg() {
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
        console.log("FFmpeg has been loaded successfully.");
    }
}

async function convertFiles() {
    await loadFFmpeg();

    const input = document.getElementById('fileInput').files[0];
    if (!input) {
        alert("Please select a MOV file.");
        return;
    }

    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    const fileName = input.name.split('.').slice(0, -1).join('.'); 
    const inputFile = 'input.mov';
    const outputMp4 = 'output.mp4';
    const outputGif = 'output.gif';

    ffmpeg.FS('writeFile', inputFile, await fetchFile(input));

    let outputHTML = "<h3>Download your file:</h3>";

    if (selectedFormat === "mp4") {
        await ffmpeg.run('-i', inputFile, '-c:v', 'libx264', '-preset', 'fast', outputMp4);
        const mp4Data = ffmpeg.FS('readFile', outputMp4);
        const mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });
        outputHTML += `<a href="${URL.createObjectURL(mp4Blob)}" download="${fileName}.mp4">Download MP4</a>`;
    } else if (selectedFormat === "gif") {
        await ffmpeg.run('-i', inputFile, '-vf', 'fps=10,scale=320:-1:flags=lanczos', '-gifflags', '+transdiff', outputGif);
        const gifData = ffmpeg.FS('readFile', outputGif);
        const gifBlob = new Blob([gifData.buffer], { type: 'image/gif' });
        outputHTML += `<a href="${URL.createObjectURL(gifBlob)}" download="${fileName}.gif">Download GIF</a>`;
    }

    document.getElementById('output').innerHTML = outputHTML;
}
