import * as THREE from "three";
import { WorkTimelinePoint } from "../types";

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: '2020',
    title: 'Intern at Tech Access, New Delhi',
    subtitle: 'Kickstarted my career in frontend development. Focused on UI optimization and best practices.',
    position: 'right',
  },
  {
    point: new THREE.Vector3(-4, -4, -3),
    year: '2020',
    title: 'Frontend Developer at Tech Access, New Delhi',
    subtitle: 'Specialized in frontend development and reusable components. Enhanced website performance and accessibility.',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-3, -1, -6),
    year: '2024',
    title: 'Intern at The Assigner',
    subtitle: 'Gained hands-on experience in UI/UX and frontend development. Designed user-friendly interfaces.',
    position: 'left',
  },
  {
    point: new THREE.Vector3(0, -1, -10),
    year: 'Present',
    title: 'UI/UX Designer & Frontend Developer',
    subtitle: 'Leading design and development projects. Developed responsive apps and enhanced UI/UX.',
    position: 'left',
  },
  {
    point: new THREE.Vector3(1, 1, -12),
    year: '2025',
    title: 'B.Tech, Computer Science',
    subtitle: 'NIST, Berhampur. Graduation: May 2025',
    position: 'right',
  },
  {
    point: new THREE.Vector3(2, 2, -14),
    year: '2020',
    title: 'Diploma in ITESM',
    subtitle: 'Aditya Institute of Technology, New Delhi',
    position: 'right',
  }
];