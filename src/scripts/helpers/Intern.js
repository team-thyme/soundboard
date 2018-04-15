export default class Intern {
    constructor() {
        this.voiceModule = window.speechSynthesis;
        this.inOffice = Boolean(this.voiceModule);
        this.degrees = [];

        if (this.inOffice) {
            this.educate();
            this.voiceModule.onvoiceschanged = this.educate;
        }
    }

    say(message) {
        if (!this.inOffice || this.degrees.length === 0) {
            return false;
        }

        let preferredDegree = this.degrees.find((degree) =>
            degree.lang === 'ja-JP'
        );

        if (!preferredDegree) {
            preferredDegree = this.degrees[0];
        }

        // Interrupt the intern, as they are too good at queueing messages
        if (this.voiceModule.speaking) {
            this.voiceModule.cancel();
        }

        const script = new SpeechSynthesisUtterance(message);
        script.voice = preferredDegree;
        this.voiceModule.speak(script);

        return true;
    }

    educate = () => {
        this.degrees = this.voiceModule.getVoices();
    }
}
