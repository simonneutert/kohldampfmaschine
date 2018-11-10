document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementsByTagName("e24").length <= 0) {
    return // guard clause
  }

  function loadJSON(path, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (success) {
            success(JSON.parse(xhr.responseText));
          }
        } else {
          if (error) {
            error(xhr);
          }
        }
      }
    };
    xhr.open("GET", path, true);
    xhr.send();
  }

  function addUrlToEdekaHtmlTags(data, tag) {
    let html5Tags = document.getElementsByTagName(tag);
    if (html5Tags.length > 0) {
      addAttributeWithDefaultVal(data, 'score', 0);
      for (let element of html5Tags) {
        var tempHTML = element.innerHTML;
        for (let word of productNameList(element.textContent)) {
          if (word.length < 4) {
            continue; // guard clause
          } else {
            runComparison(data, word);
          }
        }
        writeLinkToHtml(data, element)
        resetScores(data);
      }
    }
  }

  function addAttributeWithDefaultVal(data, attr, val) {
    for (let element in data) {
      data[element][attr] = val;
    }
  }

  function productNameList(p) {
    return p.toLowerCase().replace(/[^A-Za-z0-9!?]/g, "_").split('_')
  }

  function runComparison(data, word) {
    for (let element in data) {
      for (let productNameWord of data[element].name.split(' ')) {
        if (productNameWord.length < 4) {
          continue; // guard clause
        } else {
          let match = word.toLowerCase().match(productNameWord.toLowerCase());
          if (!match) {
            continue; // guard clause
          } else {
            scoreProduct(data, element, match)
          }
        }
      }
    }
  }

  function scoreProduct(data, element, match) {
    if (match.index === 0) {
      // scores full match
      data[element].score += 100;
    } else if (match.index > 0) {
      // scores partly match
      data[element].score += 10;
    }
  }

  function writeLinkToHtml(data, element) {
    const tempHTML = element.innerHTML;
    const productWithHighestMatchUrl = filterSortMatches(data).pop().url;
    element.innerHTML = "<a href=\"http://edeka24.de" + productWithHighestMatchUrl + "\" target=\"_blank\">" + tempHTML + "</a>";
  }

  function filterSortMatches(data) {
    let matches = [];
    for (let hit in data) {
      if (data[hit].score > 100) {
        matches.push(data[hit]);
      }
    }
    matches.sort(function(a, b) {
      return a.score - b.score;
    });
    return matches;
  }

  function resetScores(data) {
    for (let element in data) {
      data[element].score = 0;
    }
  }

  loadJSON('/products.json',
    function(data) {
      addUrlToEdekaHtmlTags(data, "e24");
    },
    function(xhr) {
      // ajax failed
      console.error(xhr);
    }
  );
});
