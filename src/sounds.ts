import soundsData from './sounds.json';

export interface Track {
    file: string;
    name: string;
}

export interface Sounds {
    path: string;
    effects: Record<string, string[]>;
    music: Track[];
}

const sounds: Sounds = soundsData;

export default sounds;
