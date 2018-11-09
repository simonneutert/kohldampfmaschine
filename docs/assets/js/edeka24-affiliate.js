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

  function score(data, element, match) {
    if (match.index === 0) {
      data[element].score += 100;
    } else if (match.index > 0) {
      data[element].score += 10;
    }
  }

  function filterSortMatches(data) {
    let matches = [];
    for (hit in data) {
      if (data[hit].score > 100) {
        matches.push(data[hit]);
      }
    }
    matches.sort(function(a, b) {
      return a.score - b.score;
    });
    return matches;
  }

  function addAttributeWithDefaultVal(data, attr, val) {
    for (var element in data) {
      data[element][attr] = val;
    }
  }

  function writeLinkToHtml(data, e) {
    const tempHTML = e.innerHTML;
    e.innerHTML = "<a href=\"http://edeka24.de" + filterSortMatches(data).pop().url + "\" target=\"_blank\">" + tempHTML + "</a>";
  }

  function productNameList(p) {
    return p.toLowerCase().replace(/[^A-Za-z0-9!?]/g, "_").split('_')
  }

  loadJSON('/products.json',
    function(data) {
      const edeka24 = document.getElementsByTagName("e24");
      if (edeka24.length > 0) {
        addAttributeWithDefaultVal(data, 'score', 0)
        for (e of edeka24) {
          for (word of productNameList(e.textContent)) {
            if (word.length < 4) {
              continue; // guard clause
            } else {
              for (element in data) {
                for (productName of data[element].name.split(' ')) {
                  if (productName.length < 4) {
                    continue; // guard clause
                  } else {
                    let match = word.toLowerCase().match(productName.toLowerCase());
                    if (!match) {
                      continue; // guard clause
                    } else {
                      score(data, element, match)
                    }
                  }
                }
              }
            }
          }
          writeLinkToHtml(data, e)
          resetScores(data);
        } // end of edeka24 tag loop
      }
    },
    function(xhr) {
      // ajax failed
      console.error(xhr);
    }
  );
});
