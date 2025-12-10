window.config = {
  routerBasename: "/",
  extensions: [],
  modes: [],
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showLoadingIndicator: true,
  strictZSpacingForVolumeViewport: true,
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  defaultDataSourceName: 'dicomweb',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'dicomweb',
      configuration: {
        friendlyName: 'DCM4CHEE Server',
        name: 'DCM4CHEE',
        wadoUriRoot: '/dicomweb/rs',
        qidoRoot: '/dicomweb/rs',
        wadoRoot: '/dicomweb/rs',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        singlepart: 'bulkdata,video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },
  ],
/*  whiteLabeling: {
    createLogoComponentFn: function(React) {
      return React.createElement(
        'div',
        {
          className: 'header-brand',
          style: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          },
          onClick: function(e) {
            e.preventDefault();
            // Navigate without reload using history API
            if (window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }
        },
        [
          React.createElement('div', {
            key: 'logo',
            style: {
              background: 'url(/logo.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              width: '30px',
              height: '30px',
              marginRight: '12px',
            },
          }),
          React.createElement('span', {
            key: 'text',
            style: {
              color: 'white',
              fontSize: '20px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            },
          }, 'OHIF SIMGos Community')
        ]
      );
    },
  },
*/
  httpErrorHandler: (error) => {
    console.error(error);
  },
  studyListFunctionsEnabled: true,
  hotkeys: [
    {
      commandName: "incrementActiveViewport",
      label: "Next Viewport",
      keys: ["right"],
    },
    {
      commandName: "decrementActiveViewport",
      label: "Previous Viewport",
      keys: ["left"],
    },
    { commandName: "rotateViewportCW", label: "Rotate Right", keys: ["r"] },
    { commandName: "rotateViewportCCW", label: "Rotate Left", keys: ["l"] },
    { commandName: "invertViewport", label: "Invert", keys: ["i"] },
    {
      commandName: "flipViewportVertical",
      label: "Flip Horizontally",
      keys: ["h"],
    },
    {
      commandName: "flipViewportHorizontal",
      label: "Flip Vertically",
      keys: ["v"],
    },
    { commandName: "scaleUpViewport", label: "Zoom In", keys: ["+"] },
    { commandName: "scaleDownViewport", label: "Zoom Out", keys: ["-"] },
    { commandName: "fitViewportToWindow", label: "Zoom to Fit", keys: ["="] },
    { commandName: "resetViewport", label: "Reset", keys: ["space"] },
    { commandName: "nextImage", label: "Next Image", keys: ["down"] },
    { commandName: "previousImage", label: "Previous Image", keys: ["up"] },
    {
      commandName: "previousViewportDisplaySet",
      label: "Previous Series",
      keys: ["pagedown"],
    },
    {
      commandName: "nextViewportDisplaySet",
      label: "Next Series",
      keys: ["pageup"],
    },
    { commandName: "setZoomTool", label: "Zoom", keys: ["z"] },
    {
      commandName: "windowLevelPreset1",
      label: "W/L Preset 1",
      keys: ["1"],
    },
    {
      commandName: "windowLevelPreset2",
      label: "W/L Preset 2",
      keys: ["2"],
    },
    {
      commandName: "windowLevelPreset3",
      label: "W/L Preset 3",
      keys: ["3"],
    },
    {
      commandName: "windowLevelPreset4",
      label: "W/L Preset 4",
      keys: ["4"],
    },
    {
      commandName: "windowLevelPreset5",
      label: "W/L Preset 5",
      keys: ["5"],
    },
    {
      commandName: "windowLevelPreset6",
      label: "W/L Preset 6",
      keys: ["6"],
    },
    {
      commandName: "windowLevelPreset7",
      label: "W/L Preset 7",
      keys: ["7"],
    },
    {
      commandName: "windowLevelPreset8",
      label: "W/L Preset 8",
      keys: ["8"],
    },
    {
      commandName: "windowLevelPreset9",
      label: "W/L Preset 9",
      keys: ["9"],
    },
  ],
};
