$(function() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
  window.URL = window.URL || window.webkitURL;

  var video = document.getElementById('myVideo');
  var localStream = null;
  navigator.getUserMedia({video: true, audio: false},
    function(stream) {
      console.log(stream);
      video.src = window.URL.createObjectURL(stream);

      function dataURItoBlob(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
        else
          byteString = unescape(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
      }

      var post = function(dataUrl) {
        var url = '/api/v1/age';
        var fd = new FormData();
        fd.append('file', dataURItoBlob(dataUrl));

        $.ajax({
          type: 'POST',
          url: url,
          data: fd,
          processData: false,
          contentType: false,
          success: function (data) {
            if (data.error) {
              console.log('error!');
            } else {
              $.each(data.faces, function(index, face) {
                console.log(face);
                var age = face.age;
                var width = face.faceRectangle.width;
                var height = face.faceRectangle.height;
                var top = face.faceRectangle.top;
                var left = face.faceRectangle.left;
                var gender = face.gender;

                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');

                var text = age + '歳';
                if (gender === 'Male') {
                  ctx.strokeStyle = "#0000FF";
                  ctx.fillStyle = '#0000FF';
                  text += '男性';
                } else {
                  ctx.strokeStyle = "#FF0000";
                  ctx.fillStyle = '#FF0000';
                  text += '女性';
                }
                ctx.font= 'bold 70px Century Gothic';
                ctx.strokeRect(left, top, width, height);
                ctx.fillText(text, left, top);
              });
            }
          }
        });
      };

      $('#sendButton').click(function() {
        if (stream) {
          var canvas = document.getElementById('canvas');
          var ctx = canvas.getContext('2d');

          var w = video.offsetWidth;
          var h = video.offsetHeight;

          canvas.setAttribute("width", w);
          canvas.setAttribute("height", h);

          ctx.drawImage(video, 0, 0);
          post(canvas.toDataURL('image/png'));
        }
      });
    },
    function(err) { // for error case
      console.log(err);
    }
  );
});
