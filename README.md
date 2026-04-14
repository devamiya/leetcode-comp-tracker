# LeetCode Compensation Tracker

A modern dashboard to track and visualize compensation data from LeetCode Discuss. This project parses community-shared salary information and presents it in an interactive, easy-to-digest format.

## 🚀 Features

- **Real-time Visualization**: Interactive charts (Top Companies, Role Distribution, Salary Scatter Plot) using Chart.js.
- **Advanced Filtering**: Filter by period, role, and search queries.
- **Multi-Currency Support**: View compensation details in your preferred currency.
- **Responsive Design**: Premium UI with glassmorphism, ambient backgrounds, and full mobile support.
- **Dark Mode**: Seamless theme switching for comfortable viewing.
- **Data Sourced from LeetCode**: Automatically tracks data from the LeetCode Discuss Compensation section.

## 📂 Project Structure

```text
├── public/              # Static assets and data.json
├── src/
│   ├── components/      # UI Components (Table, Cards, Header)
│   ├── components/charts/ # Chart.js wrappers
│   ├── hooks/           # Custom React hooks (Data fetching, filtering)
│   ├── utils/           # Helper functions for formatting and dates
│   ├── assets/          # CSS and global styles
│   └── App.jsx          # Main application entry
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🛠️ Tech Stack

- **Framework**: React 19 (Functional Components, Hooks)
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (Custom design system with glassmorphism)
- **Data Visualization**: Chart.js & react-chartjs-2
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Falcon-J/leetcode-comp-tracker.git
   cd leetcode-comp-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

## 📄 Data Attribution

The application consumes compensation data from `public/data.json`, which is sourced from the [LeetCode Discuss Compensation](https://leetcode.com/discuss/compensation) community. This project is a third-party visualization tool and is not affiliated with LeetCode.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

---

Created by [Amiya](https://linkedin.com/in/devamiya) for the developer community.
