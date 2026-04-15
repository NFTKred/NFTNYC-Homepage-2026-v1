import { Composition } from 'remotion';
import { SpeakerVideo } from './SpeakerVideo';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SpeakerVideo"
        component={SpeakerVideo}
        durationInFrames={975}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="SpeakerVideo16x9"
        component={SpeakerVideo}
        durationInFrames={975}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
