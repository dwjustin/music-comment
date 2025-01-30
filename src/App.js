import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Drawer, List, ListItem, Button, colors } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import './waveform-styles.css';
import './timeline-styles.css';
import { SkipNext } from '@mui/icons-material';
import SkipPrevious from '@mui/icons-material/SkipPrevious';
import ArrowForward from '@mui/icons-material/ArrowForward';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [isHoveredRegionId, setIsHoveredRegionId] = useState(null);
  const [regions, setRegions] = useState([]);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const region = RegionsPlugin.create();

  const random = (min, max) => Math.random() * (max - min) + min;
  const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

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

  function timeInterval(pxPerSec) {
    if (pxPerSec <= 0) {
      return 1; // fallback instead of dividing by zero
    }

    let retval = 1;
    if (pxPerSec >= 25 * 100) {
      retval = 0.01;
    } else if (pxPerSec >= 25 * 40) {
      retval = 0.025;
    } else if (pxPerSec >= 25 * 10) {
      retval = 0.1;
    } else if (pxPerSec >= 25 * 4) {
      retval = 0.25;
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

  function secondaryLabelInterval(pxPerSec) {
    return Math.floor(10 / timeInterval(pxPerSec));
  }

  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#FF69B4',
      progressColor: '#F7CAC9',
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
            backgroundColor: 'grey',
            opacity: 1,
          },
        }),
        region,
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
        console.log('region clicked', region.start);
        region.play(region.start, region.end);
        setIsPlaying(true);
      });

      region.on('region-created', (region) => {
        console.log('Region created:', region);

        region.on('over', () => {
          setHoveredRegion(region);
        });

        region.on('out', () => {
          setHoveredRegion(null);
        });
      });
    });

    wavesurfer.current.on('finish', () => setIsPlaying(false));

    wavesurfer.current.on('region-updated', (region) => {
      console.log('Updated region', region);
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
        <div className="border rounded-lg p-8 bg-black shadow-sm">
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
              ${isReady ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}
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
              onChange={handleZoom}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              value={currentZoom}
              disabled={!isReady}
              className={`w-32 ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      </div>

      <div style={{ width: DRAWER_WIDTH, height: '100vh', backgroundColor: '#666666' }}>
        <h2 className="text-lg font-semibold">Fixed Container</h2>
        <p>This is a fixed container on the right side.</p>
      </div>
    </div>
  );
};

export default WaveformWithTimeline;