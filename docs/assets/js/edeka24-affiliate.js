document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementsByTagName("e24").length <= 0) {
    return
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

  // https://stackoverflow.com/a/36566052
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  // https://stackoverflow.com/a/36566052
  function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }


  loadJSON('/products.json',
    function(data) {
      const edeka24 = document.getElementsByTagName("e24");
      if (edeka24.length > 0) {
        for (e of edeka24) {
          let matches = [];
          const eSignature = e.textContent.toLowerCase().replace(/\s/g, "").split('').sort().join('').replace(/[^A-Za-z0-9\s!?]/g, "");
          // similarity(e.signature, eSignature);
          for (element in data) {
            const obj = data[element]
            obj.similarity = similarity(eSignature, obj.signature);
            matches.push(obj);
          }
          matches.sort(function(a, b) {
            return a.similarity - b.similarity;
          });
          const result = matches.pop();
          const eOld = e.innerHTML;
          e.innerHTML = "<a href=\"http://edeka24.de"+result.url+"\" target=\"_blank\">"+eOld+"</a>";
          // console.log(matches.pop());
          // console.log(e.textContent);
        }
        // console.log(eSignature);
      }
    },
    function(xhr) {
      console.error(xhr);
    }
  );

});
