import Joyride, { type CallBackProps, STATUS, type Step } from 'react-joyride';

interface GuidedTourProps {
  steps: Step[];
  run: boolean;
  onComplete?: () => void;
}

export default function GuidedTour({ steps, run, onComplete }: GuidedTourProps) {
  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: 'rgb(197, 48, 48)',
          zIndex: 10000,
          arrowColor: 'rgb(26, 54, 93)',
          backgroundColor: 'rgb(26, 54, 93)',
          textColor: '#fff',
        },
        tooltip: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 700,
        },
        buttonNext: {
          backgroundColor: 'rgb(197, 48, 48)',
          borderRadius: '6px',
          fontSize: '13px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
        },
        buttonSkip: {
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
        },
        spotlight: {
          borderRadius: '8px',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Got it',
        last: 'Let\'s go!',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}
