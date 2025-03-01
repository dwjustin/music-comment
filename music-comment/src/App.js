import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import './waveform-styles.css';
import './timeline-styles.css';
import { SkipNext } from '@mui/icons-material';
import SkipPrevious from '@mui/icons-material/SkipPrevious';
import ArrowForward from '@mui/icons-material/ArrowForward';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.esm.js';

const AUDIO_URL = 'audio/type_beat.wav';
const MIN_ZOOM = 0;
const MAX_ZOOM = 500;
const DRAWER_WIDTH = 600;

const WaveformWithTimeline = () => {
  const waveformRef = useRef(null);
  const timelineRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(MIN_ZOOM);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [showTimestamp, setShowTimestamp] = useState(false);



  const region = RegionsPlugin.create({
    lineColor: '#ff0000',
    lineWidth: 2,
    labelBackground: '#555',
    labelColor: '#fff',
    labelSize: '11px',
  });
  const hover = HoverPlugin.create();

  const random = (min, max) => Math.random() * (max - min) + min;
  // const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;
  const randomColor = () => 'rgba(229, 194, 192, 0.5)'; // Blue color
  // 리전 지정시 색: rgba(229, 194, 66, 0.5)
  // 리전 댓글 고정색: rgba(156, 143, 184, 0.5)
  function formatTimeCallback(seconds, pxPerSec) {
    seconds = Number(seconds);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    // fill up seconds with zeroes
    var secondsStr = Math.round(seconds).toString();
    if (pxPerSec >= 25 * 10) {
      secondsStr = seconds.toFixed(2);
    } else if (pxPerSec >= 25 * 1) {
      secondsStr = seconds.toFixed(1);
    }

    if (minutes > 0) {
      if (seconds < 10) {
        secondsStr = '0' + secondsStr;
      }
      return `${minutes}:${secondsStr}`;
    }
    return secondsStr;
  }


  function primaryLabelInterval(pxPerSec) {
    var retval = 1;
    if (pxPerSec >= 25 * 100) {
      retval = 10;
    } else if (pxPerSec >= 25 * 40) {
      retval = 4;
    } else if (pxPerSec >= 25 * 10) {
      retval = 10;
    } else if (pxPerSec >= 25 * 4) {
      retval = 4;
    } else if (pxPerSec >= 25) {
      retval = 1;
    } else if (pxPerSec * 5 >= 25) {
      retval = 5;
    } else if (pxPerSec * 15 >= 25) {
      retval = 15;
    } else {
      retval = Math.ceil(0.5 / pxPerSec) * 60;
    }
    return retval;
  }

  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#BFB7D0',
      progressColor: '#8271A6',
      cursorColor: 'red',
      cursorWidth: 3,
      backend: 'MediaElement',
      height: 200,
      autoScroll: false,
      autoCenter: false,
      scrollParent: true,
      splitChannels: true,
      hideScrollbar: false,
      plugins: [
        TimelinePlugin.create({
          container: timelineRef.current,
          formatTimeCallback: formatTimeCallback,
          primaryLabelInterval: primaryLabelInterval,
          insertPosition: 'beforebegin',
          style: {
            display: 'block',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '12px',
            backgroundColor: '#43297B',
            opacity: 1,
          },
        }),
        region,
        hover,
      ],
    });

    wavesurfer.current.load(AUDIO_URL);

    wavesurfer.current.on('ready', () => {
      setIsReady(true);
      region.enableDragSelection({
        color: randomColor(),
      });

      region.on('region-clicked', (region, e) => {
        e.stopPropagation();
        console.log('region clicked', region.id);
        region.play(region.start, region.end);
        setIsPlaying(true);
      });

      region.on('region-created', (newRegion) => {
        console.log('Region created:', newRegion.id);
        
          // If there's an existing region, remove it
        if (currentRegion) {
          currentRegion.remove();
          setCurrentRegion(null);
        }
        
        setCurrentRegion(newRegion);
      
        // 1. Make sure the region container is relatively positioned
        //    so absolutely positioned children can be placed correctly
        newRegion.element.style.position = 'absolute';
      
        // 2. Create a container <div> to hold the two buttons side-by-side
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '50%';
        buttonContainer.style.left = '50%';
        buttonContainer.style.transform = 'translate(-50%, -50%)';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'row'; 
        buttonContainer.style.gap = '12px';           // increased space between buttons
        buttonContainer.style.alignItems = 'center';
      
        // 3. Create the "Comment" button
        const commentButton = document.createElement('button');
        commentButton.innerText = 'Comment';
        commentButton.style.borderRadius = '6px';     // slightly larger radius
        commentButton.style.border = 'none';
        commentButton.style.padding = '8px 16px';     // increased padding
        commentButton.style.cursor = 'pointer';
        commentButton.style.fontSize = '14px';        // larger text
        // Stop clicks from also triggering the region click event
        commentButton.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('Comment button clicked for region:', newRegion.id);
          // Add your custom comment logic here...
        });
      
        // 4. Create the "Remove" button
        const removeButton = document.createElement('button');
        removeButton.innerText = 'Remove';
        removeButton.style.borderRadius = '6px';      // slightly larger radius
        removeButton.style.border = 'none';
        removeButton.style.padding = '8px 16px';      // increased padding
        removeButton.style.cursor = 'pointer';
        removeButton.style.fontSize = '14px';         // larger text
        removeButton.style.backgroundColor = 'red';
        removeButton.style.color = 'white';
        removeButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent region click event
          console.log('Remove button clicked for region:', newRegion.id);
          newRegion.remove();  // This removes the region from WaveSurfer
          setCurrentRegion(null); // Clear current region
        });
      
        // 5. Append both buttons into the container
        buttonContainer.appendChild(commentButton);
        buttonContainer.appendChild(removeButton);
      
        // 6. Finally, append the container into the region's DOM element
        newRegion.element.appendChild(buttonContainer);
      });
      
    });

    wavesurfer.current.on('finish', () => setIsPlaying(false));

    wavesurfer.current.on('region-updated', (region) => {
      console.log('Updated region', region);
      setCurrentRegion(region);
    });

    return () => {
      wavesurfer.current.destroy();
    };
  }, []);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleZoom = (e) => {
    const zoomLevel = Number(e.target.value);
    setCurrentZoom(zoomLevel);
    wavesurfer.current.zoom(zoomLevel);
  };

  const getBacktoZero = () => {
    if (wavesurfer.current) {
      wavesurfer.current.seekTo(0);
      wavesurfer.current.pause();
      setIsPlaying(false);
    }
  };

  const skipBackwardFiveSec = () => {
    wavesurfer.current.skip(-5);
  };

  const skipForwardFiveSec = () => {
    wavesurfer.current.skip(5);
  };
  
  return (
    <div className="mx-auto space-y-6 flex bg-white">
      <div className="flex-1 p-8" style={{ width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
        <div className="border rounded-lg p-8 shadow-sm">
          <div ref={waveformRef} id="waveform" />
        </div>

        <div className="flex p-8 justify-center space-x-4">
          <button onClick={getBacktoZero}>
            <ReplayIcon />
          </button>
          <button onClick={skipBackwardFiveSec}>
            <SkipPrevious />
          </button>
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className={`px-4 py-2 text-white rounded transition-colors 
              ${isReady ? 'bg-[#43297B] hover:bg-[#BFB7D0]' : 'bg-[#BFB7D0] cursor-not-allowed'}
              `}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </button>
          <button onClick={skipForwardFiveSec}>
            <SkipNext />
          </button>
          <div className="flex items-center space-x-2">
            <span>Zoom:</span>
            <input
              type="range"
              style={{ backgroundColor: '#43297B' }}
              onChange={handleZoom}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              value={currentZoom}
              disabled={!isReady}
              className={`w-32 ${!isReady ? 'opacity-50 bg-[#43297B] cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="pr-8 pl-8 pt-8 pb-8 bg-black">
          <div className="flex items-center space-x-2">
            <input type="text" className="border p-2" placeholder="댓글 입력하기" />
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              <ArrowForward />
            </button>
          </div>
          
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="myCheckbox"
            onChange={(e) => setShowTimestamp(e.target.checked)} 
          />
          <label htmlFor="myCheckbox">타임 스탬프 추가</label>
          {showTimestamp && currentRegion && (
            <div className="ml-4">
              <span className="mr-2">Start: {currentRegion.start}s</span>
              <span>End: {currentRegion.end}s</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: DRAWER_WIDTH, height: '100vh', backgroundColor: '#666666' }}>
        <h2 className="text-lg font-semibold">Fixed Container</h2>
        <p>This is a fixed container on the right side.</p>
      </div>
    </div>
  );
};

export default WaveformWithTimeline;