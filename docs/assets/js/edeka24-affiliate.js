"use strict";
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
    if (html5Tags.length <= 0) {
      return;
    }
    addAttributeWithDefaultVal(data, 'score', 0);
    for (let element of html5Tags) {
      let tempHTML = element.innerHTML;
      const productNames = productNameList(element.textContent);
      productNameCheck(data, productNames);
      writeLinkToHtml(data, element);
      resetScores(data);
    }
  }

  function addAttributeWithDefaultVal(data, attr, val) {
    for (let element in data) {
      data[element][attr] = val;
    }
  }

  function productNameList(productName) {
    return productName.toLowerCase().replace(/[^A-Za-z0-9!?']/g, "_").split('_');
  }


  function productNameCheck(data, productNameList) {
    if (productNameList.length < 2) {
      return;
    }

    for (let word of productNameList) {
      if (word.length > 3) {
        runComparisonScore(data, word);
      }
    }
  }

  function matchStrings(a, b) {
    if (a.length <= b.length) {
      return a.toLowerCase().match(b.toLowerCase());
    } else {
      return b.toLowerCase().match(a.toLowerCase());
    }
  }

  function runComparisonScore(data, word) {
    for (let element in data) {
      for (let productName of data[element].name.split(' ')) {
        if (productName.length > 3) {
          scoreProduct(data, element, matchStrings(word, productName));
        }
      }
    }
  }

  function scoreProduct(data, element, match) {
    if (match === null || match === undefined) {
      return;
    } else if (match.index === 0) {
      // scores full match
      data[element].score += 100;
    } else if (match.index > 0) {
      // scores part match
      data[element].score += 10;
    }
  }

  function writeLinkToHtml(data, element) {
    const tempHTML = element.innerHTML;
    const productWithHighestMatchUrl = filterSortMatches(data).pop().url;
    element.innerHTML = resultLink(productWithHighestMatchUrl, tempHTML);
  }

  function resultLink(productWithHighestMatchUrl, tempHTML) {
    let html = '<a href="http://edeka24.de';
    html += productWithHighestMatchUrl;
    html += '" target="_blank">';
    html += tempHTML;
    html += '</a>';
    return html;
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

  loadJSON('/products.json', function(data) {
      addUrlToEdekaHtmlTags(data, "e24");
    },
    function(xhr) {
      // ajax failed
      console.error(xhr);
    }
  );
});
