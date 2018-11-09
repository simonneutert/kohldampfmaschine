document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementsByTagName("e24").length <= 0) {
    return
  }

  function resetScores(data) {
    for (element in data) {
      data[element].score = 0;
    }
  }

  function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (success)
            success(JSON.parse(xhr.responseText));
        } else {
          if (error)
            error(xhr);
        }
      }
    };
    xhr.open("GET", path, true);
    xhr.send();
  }

  loadJSON('/products.json',
    function(data) {
      const edeka24 = document.getElementsByTagName("e24");
      if (edeka24.length > 0) {
        let matches = [];
        for (var element in data) {
          data[element].score = 0;
        }
        for (e of edeka24) {
          const eSignature = e.textContent.toLowerCase().replace(/[^A-Za-z0-9!?]/g, "_").split('_');
          for (word of eSignature) {
            if (word.length < 4) {
              continue;
            }
            for (element in data) {
              for (productName of data[element].name.split(' ')) {
                if (productName.length < 4) {
                  continue;
                }
                let match = word.toLowerCase().match(productName.toLowerCase());
                if (!match) {
                  continue;
                }
                if (match.index === 0) {
                  data[element].score += 100;
                } else if (match.index > 0) {
                  data[element].score += 10;
                }
              }
            }
          }
          for (hit in data) {
            if (data[hit].score > 100) {
              matches.push(data[hit]);
            }
          }
          matches.sort(function(a, b) {
            return a.score - b.score;
          });
          let tempHTML = e.innerHTML;
          e.innerHTML = "<a href=\"http://edeka24.de" + matches.pop().url + "/" target=\"_blank\">" + tempHTML + "</a>";
          resetScores(data);
        } // end of edeka24 tag loop
      }
    },
    function(xhr) {
      console.error(xhr);
    }
  );
});
