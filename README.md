# Mindful AI 🌿

Mindful AI is an intelligent wellness and productivity tracking application designed to help you synchronize your work and life with your natural rhythms. By integrating mood tracking, hormonal cycle awareness, and AI-driven insights, Mindful AI empowers you to optimize your energy levels and emotional well-being.

![GHBanner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Key Features

- **🧘 Holistic Tracking**: Monitor daily mood, energy levels, focus, and emotional reactivity.
- **🌙 Cycle Synchronization**: Track hormonal phases and understand how they impact your productivity and mental state.
- **🎭 Archetypes & Modes**: Assign daily archetypes (Warrior, Sage, Magician, Healer) and production modes (Build, Learn, Ideate, Rest) to align your tasks with your current state.
- **🧠 AI Insights (Gemini)**: Receive personalized reports and pattern analysis powered by Google Gemini 2.5 Flash. Identify burnout risks, trigger correlations, and optimal productivity windows.
- **⚡ Trigger Logging**: Document emotional triggers and resolutions to build deeper self-awareness and resilience.
- **🎙️ Voice Sessions**: Use AI-assisted voice sessions for therapeutic reflections and automated analysis reports.
- **📊 Quarterly & Annual Planning**: Set long-term goals and track your progress through structured lanes and blockers.

## 🛠️ Tech Stack

- **Frontend**: React (with Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Vanilla CSS
- **AI Engine**: Google Gemini API (Google Generative AI SDK)
- **Routing**: React Router (HashRouter)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- A Google Cloud Project with the [Gemini API](https://aistudio.google.com/) enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/violettance/mindful.ai.git
   cd mindful.ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file (or use `.env.local`) in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *(Note: The `vite.config.ts` is pre-configured to map this variable to `process.env.API_KEY` in the application).*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🗺️ Navigation

- **Daily Mood**: Your dashboard for logging daily metrics.
- **Voice Session**: A space for verbal reflection analyzed by AI.
- **Trigger Log**: Track and resolve emotional triggers.
- **Cycle Tracker**: Monitor your hormonal phase and symptoms.
- **Insights**: AI-generated reports based on your history.
- **Quarterly Output**: High-level goal tracking.
- **Annual Plan**: Long-term strategy and phase mapping.

## 🔒 Privacy

Mindful AI is designed with privacy in mind. Data is stored locally in your browser to ensure you remain in control of your personal information.

---

*Harness the power of AI to live and work mindfully.*
