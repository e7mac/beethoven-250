for (var i = 0; i < tracks.length; i++) {
  var data = tracks[i];
  createPlayer(data); // id for player
}

function createPlayer(data) {

  //Create nodes
  var player = document.getElementById(data.div);
  var controls = newChildDivToNodeWithClass(player, 'controls');
  var title = newChildDivToNodeWithClass(controls, 'title');
  title.innerHTML = data.title 

  var container = newChildDivToNodeWithClass(player, 'player-container');

  var music = document.createElement('audio');
  music.src = data.audio;
  container.appendChild(music);

  var playhead;

  var duration = music.duration;

  setSectionWidths();
  addBarStartLabels();
  addSectionTitles();
  addBoxes();
  addBarLabels();
  addCadences();
  addKeys();
  addControls();

  function newChildDivToNodeWithClass(parent, classes) {
    var node = document.createElement('div');
    node.classList = [classes];
    parent.appendChild(node);
    return node;
  }

  function fractionalPositionOfStartOfBar(desiredBar, barStartInSection, barEndInSection) {
    return (desiredBar - barStartInSection) / (barEndInSection - barStartInSection + 1);
  }

  function setSectionWidths() {
    const addCSS = (s)=>((d,e)=>{ e = d.createElement("style");e.innerHTML = s;d.head.appendChild(e)})(document);
    var bars = []
    var times = []
    var trackEndTime = 0;
    for (var i=0; i<data.sections.length; i++) {
      var section = data.sections[i];
      var barStart = section.bar_start
      var barEnd = section.bar_end
      var timeStart = section.time_start
      var timeEnd = section.time_end
      trackEndTime = timeEnd;
      bars.push(barEnd - barStart + 1)
      if ((typeof timeStart !== 'undefined') && (typeof timeEnd !== 'undefined')) {
        times.push(timeEnd - timeStart)
      }
    }
    totalBars = bars.reduce((a, b) => a + b, 0)
    for (var i=0; i<data.sections.length; i++) {
      var width = 0;
      if (times.length > 0) {
        //time based width
        width = times[i] / trackEndTime * 100;
      } else {
        //bar based width
        width = bars[i] / totalBars * 100;
      }
      var j = i + 1
      addCSS("." + data.div + "-section-" + j + " {width: " + width + "%;}")
    }
  }

  function addSectionTitles() {
    var measures = newChildDivToNodeWithClass(container, 'sections')
    for (var i=0; i<data.sections.length; i++) {
      var section = data.sections[i];
      var element = document.createElement('div');
      var j = i + 1
      element.classList.add(data.div + "-section-" + j);
      element.style.position = "relative"
      var m = document.createElement('div');
      m.classList.add('section-name');
      m.innerHTML = section.name;
      element.appendChild(m);
      measures.append(element);
    }
  }

  function addBarStartLabels() {
    var measures = newChildDivToNodeWithClass(container, 'sections')
    for (var i=0; i<data.sections.length; i++) {
      var section = data.sections[i];
      var element = document.createElement('div');
      var j = i + 1
      element.classList.add(data.div + "-section-" + j);
      element.style.position = "relative"
      var m = document.createElement('div');
      m.style.marginLeft = "0%"
      m.innerHTML = section.bar_start;
      element.appendChild(m);
      measures.append(element);
    }
  }

  function addSubsectionBoxes(parent, section) {
    var boxes = newChildDivToNodeWithClass(parent, 'subsections');
    subsections = section.subsections
    for (var i=0; i<subsections.length; i++) {
      var subsection = subsections[i];
      var element = document.createElement('div');
      var j = i + 1
      if (i==subsections.length-1) {
        element.classList.add("subbox");
        element.classList.add("last");
      } else {
        element.classList.add("subbox");
      }
      element.classList.add("-subsection-" + j);
      var a = document.createElement('a');
      a.href = subsection.link;
      a.innerHTML = subsection.name;
      if ((typeof subsection.time_start !== 'undefined') && (typeof subsection.time_end !== 'undefined')) {
        element.style.width = 100 * (subsection.time_end - subsection.time_start) / (section.time_end - section.time_start) + "%"
      } else {
        element.style.width = 100 * (subsection.bar_end - subsection.bar_start + 1) / (section.bar_end - section.bar_start + 1) + "%"
      }
      element.appendChild(a);
      boxes.append(element);
    }
  }

  function addBoxes() {
    var boxes = newChildDivToNodeWithClass(container, 'sections');
    for (var i=0; i<data.sections.length; i++) {
      var section = data.sections[i];
      var element = document.createElement('div');
      var j = i + 1
      // element.classList.add("box");
      element.classList.add(data.div + "-section-" + j);
      // var a = document.createElement('a');
      // a.href = section.link;
      // a.innerHTML = section.name
      // element.appendChild(a);
      addSubsectionBoxes(element, section)
      boxes.append(element);
    }
  }

  function addSectionLabel(objectKey, bold) {
    var labels = newChildDivToNodeWithClass(container, 'sections labels');
    for (var i=0; i<data.sections.length; i++) {
      var section = data.sections[i];
      var element = document.createElement('div');
      var j = i + 1
      element.classList.add("labels");
      element.classList.add(data.div + "-section-" + j);
      if ("labels" in section) {
        for (var j=0; j<section.labels.length; j++) {
          var l = section.labels[j];
          var percent = (fractionalPositionOfStartOfBar(l.bar, section.bar_start, section.bar_end)) * 100
          var offset = l.offset
          if ((typeof offset !== 'undefined')) {
            percent = percent + parseFloat(offset)
          }
          var label = document.createElement('div');
          label.classList.add("label");
          label.style.marginLeft = percent + "%"
          if (bold === true) {
            label.innerHTML = l[objectKey].bold();
          } else {
            label.innerHTML = l[objectKey];
          }
          element.appendChild(label);
        }
      }
      labels.append(element);
    }    
  }

  function addBarLabels() {
    addSectionLabel('bar', false);
  }

  function addCadences() {
    addSectionLabel('name', false);
  }

  function addKeys() {
    addSectionLabel('key', true);
  }

  function addControls() {
    addPlayButton();
    addPlayhead();
  }

  function addPlayButton() {
    var play = document.createElement("div");
    controls.appendChild(play);
    var playButton = document.createElement("img");
    playButton.classList = ['button'];
    playButton.src = "beethoven_play.png";
    playButton.style.width = "20px";
    playButton.style.height = "20px";
    play.appendChild(playButton);
    play.addEventListener('click', function(event) {
      if (music.paused) {
        music.play();
        playButton.src = "beethoven_pause.png"
      } else {
        music.pause();
        playButton.src = "beethoven_play.png"
      }
    }, false);
  }

  function addPlayhead() {
    var duration = music.duration; 
    playhead = newChildDivToNodeWithClass(container, 'timeline');

    var isDragging = false;
    playhead.addEventListener('mousedown', function(event) {
      isDragging = true;
    });

    document.addEventListener('mousemove', function(event) {
      if (isDragging) {
        var x = event.pageX - container.getBoundingClientRect().x;
        var fraction = x / container.getBoundingClientRect().width;

        var desiredTime = fraction * music.duration;

        updatePlayhead();
        music.currentTime = desiredTime;
      }
    });

    document.addEventListener('mouseup', function(event) {
      isDragging = false;
    });

    var currentTime = document.createElement("div");
    controls.appendChild(currentTime);
    currentTime.innerHTML = "(00:00";
    var durationLabel = document.createElement("div");
    controls.appendChild(durationLabel);
    durationLabel.innerHTML = "/00:00)";

    function updatePlayhead() {
      function fmtMSS(s){return(s-(s%=60))/60+(9<s?':':':0')+s}
      var fraction = music.currentTime / music.duration;
      playhead.style.left = fraction * 100 + "%"
      currentTime.innerHTML = "(" + fmtMSS(Math.floor(music.currentTime));
      durationLabel.innerHTML = "/" + fmtMSS(Math.floor(music.duration)) + ")";
    }
    setInterval ( updatePlayhead, 10 );
  }
}