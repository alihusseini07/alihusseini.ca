export interface PortfolioItem {
  title: string;
  year: string;
  description: string;
  stack: string[];
  demo: string;
  github: string;
}

export type Category = 'projects' | 'experiences';

export const CATEGORY_META: Record<Category, { label: string; color: 'blue' | 'green'; accent: string }> = {
  projects: { label: 'Projects', color: 'blue', accent: '#3f8fd6' },
  experiences: { label: 'Experiences', color: 'green', accent: '#5db84a' },
};

export const PORTFOLIO: Record<Category, PortfolioItem[]> = {
  projects: [
    {
      title: 'Line-Follower Robot',
      year: '2025',
      description:
        'A treaded robot that reads a taped track with reflectance sensors and holds the line with a hand-tuned PID loop \u2014 smooth at speed, and recovers from sharp turns.',
      stack: ['C', 'STM32', 'PID', 'KiCad'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Telemetry Dashboard',
      year: '2025',
      description:
        'Streams live readings from a microcontroller over WebSocket and plots them in real time, with pause, zoom, and one-click CSV export.',
      stack: ['React', 'TypeScript', 'WebSocket', 'D3'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Pick-and-Place Arm',
      year: '2024',
      description:
        'A 6-DOF arm that spots parts with a webcam and sorts them into bins. Vision runs in OpenCV, motion is planned with MoveIt on ROS 2.',
      stack: ['ROS 2', 'Python', 'OpenCV', 'MoveIt'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Gesture-Fly Drone',
      year: '2024',
      description:
        'Fly a quadcopter with hand gestures \u2014 a webcam maps poses to flight commands sent over MAVLink. Built in 24 hours, landed in one piece.',
      stack: ['Python', 'OpenCV', 'MAVLink'],
      demo: '#',
      github: '#',
    },
    {
      title: 'This Portfolio',
      year: '2026',
      description:
        'The pixel-and-paper site you are reading right now \u2014 hand-built sprite folders and a lined-paper layout, no UI kit anywhere.',
      stack: ['React', 'TypeScript', 'Vite'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Anime Rec Engine',
      year: '2023',
      description:
        'Suggests your next binge from the shows you have rated, using collaborative filtering served behind a small, fast API.',
      stack: ['Python', 'PyTorch', 'FastAPI'],
      demo: '#',
      github: '#',
    },
  ],
  experiences: [
    {
      title: 'Robotics Software Intern',
      year: 'Jan \u2013 Apr 2025',
      description:
        'Placeholder \u2014 wrote and commissioned PLC and vision routines for an automated assembly cell, trimming cycle time on the pick station. Swap in your real story.',
      stack: ['C#', '.NET', 'PLC', 'Cognex'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Firmware Co-op',
      year: 'May \u2013 Aug 2024',
      description:
        'Placeholder \u2014 brought up motor-control firmware on a new board, added CAN diagnostics, and built a bench rig for regression testing. Replace with details.',
      stack: ['C', 'RTOS', 'CAN', 'Altium'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Teaching Assistant',
      year: '2024',
      description:
        'Placeholder \u2014 ran labs and office hours for a first-year programming course, and rebuilt two lab handouts that students kept getting stuck on.',
      stack: ['Python', 'MATLAB', 'Git'],
      demo: '#',
      github: '#',
    },
    {
      title: 'Robotics Club Lead',
      year: '2023 \u2013 now',
      description:
        "Placeholder \u2014 lead the software squad for the club's autonomy stack, mentoring new members and keeping the ROS 2 pipeline running on race weekends.",
      stack: ['ROS 2', 'C++', 'Docker'],
      demo: '#',
      github: '#',
    },
  ],
};
