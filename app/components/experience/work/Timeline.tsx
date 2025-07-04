import { Box, Edges, Line, Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortalStore, useScrollHintStore } from "@stores";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { WORK_TIMELINE } from "@constants";
import { WorkTimelinePoint } from "@types";

const TimelinePoint = ({ point, diff }: { point: WorkTimelinePoint, diff: number }) => {
  const getPoint = useMemo(() => {
    // Adjust horizontal offset based on screen size and position
    const horizontalOffset = isMobile ? 0.5 : 0.8;
    switch (point.position) {
      case 'left': return new THREE.Vector3(-horizontalOffset, 0, 0.1);
      case 'right': return new THREE.Vector3(horizontalOffset, 0, 0.1);
      default: return new THREE.Vector3();
    }
  }, [point.position]);

  const textAlign = point.position === 'left' ? 'right' : 'left';

  const textProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "white",
    anchorX: textAlign,
    fillOpacity: Math.max(0.3, 2 - 2 * diff),
  }), [textAlign, diff]);

  const titleProps = useMemo(() => ({
    ...textProps,
    font: "./soria-font.ttf",
    maxWidth: isMobile ? 2.5 : 4,
  }), [textProps]);

  const subtitleProps = useMemo(() => ({
    ...textProps,
    maxWidth: isMobile ? 2.5 : 4,
    anchorY: "top" as const,
  }), [textProps]);

  // Responsive scaling and spacing
  const scale = isMobile ? 0.4 : 0.7;
  const yearFontSize = isMobile ? 0.25 : 0.35;
  const titleFontSize = isMobile ? 0.4 : 0.6;
  const subtitleFontSize = isMobile ? 0.15 : 0.22;
  
  // Improved spacing between elements
  const titleYOffset = isMobile ? -0.4 : -0.6;
  const subtitleYOffset = isMobile ? -0.8 : -1.2;

  return (
    <group position={point.point} scale={scale}>
      <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
        <meshBasicMaterial color="white" wireframe />
        <Edges color="white" lineWidth={1.5} />
      </Box>
      <group>
        <group position={getPoint}>
          {/* Year */}
          <Text 
            {...textProps} 
            fontSize={yearFontSize} 
            position={[point.position === 'left' ? 0.1 : -0.1, 0.3, 0]}
          >
            {point.year}
          </Text>
          
          {/* Title */}
          <Text 
            {...titleProps} 
            fontSize={titleFontSize} 
            position={[0, titleYOffset, 0]}
          >
            {point.title}
          </Text>
          
          {/* Subtitle */}
          {point.subtitle && (
            <Text 
              {...subtitleProps} 
              fontSize={subtitleFontSize} 
              position={[0, subtitleYOffset, 0]}
            >
              {point.subtitle}
            </Text>
          )}
        </group>
      </group>
    </group>
  );
};

const Timeline = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const { showScrollHint, setScrollHint } = useScrollHintStore();
  const timeline = useMemo(() => WORK_TIMELINE, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(timeline.map(p => p.point), false), [timeline]);
  const curvePoints = useMemo(() => curve.getPoints(500), [curve]);
  const visibleCurvePoints = useMemo(() => curvePoints.slice(0, Math.max(1, Math.ceil(progress * curvePoints.length))), [curvePoints, progress]);
  const visibleTimelinePoints = useMemo(() => timeline.slice(0, Math.max(1, Math.round(progress * (timeline.length - 1) + 1))), [timeline, progress]);

  const [visibleDashedCurvePoints, setVisibleDashedCurvePoints] = useState<THREE.Vector3[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useFrame((_, delta) => {
    if (isActive) {
      const position = curve.getPoint(progress);
      // Improved camera positioning for better text visibility
      const cameraOffset = isMobile ? { x: -0.5, y: -39.5, z: 12.5 } : { x: -1.5, y: -39, z: 13 };
      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraOffset.x + position.x, 3, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraOffset.y + position.z, 3, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraOffset.z - position.y, 3, delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (groupRef.current) {
      tl.to(groupRef.current.scale, {
        x: isActive ? 1 : 0,
        y: isActive ? 1 : 0,
        z: isActive ? 1 : 0,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      });
      tl.to(groupRef.current.position, {
        y: isActive ? 0 : -2,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      }, 0);
    }

    if (isActive) {
      let i = 0;
      clearInterval(intervalRef.current!);
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const p = i++ / 100;
          setVisibleDashedCurvePoints(curvePoints.slice(0, Math.max(1, Math.ceil(p * curvePoints.length))));
          if (i > 100 && intervalRef.current) clearInterval(intervalRef.current);
        }, 10);
      }, 1000);
    } else {
      setVisibleDashedCurvePoints([]);
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      if (!showScrollHint && progress === 0) setScrollHint(true, 'SCROLL');
      if (showScrollHint && progress > 0) setScrollHint(false);
    }
  }, [isActive, progress]);

  return (
    <group position={[0, -0.1, -0.1]}>
      <Line points={visibleCurvePoints} color="white" lineWidth={3} />
      {visibleDashedCurvePoints.length > 0 && (
        <Line
          points={visibleDashedCurvePoints}
          color="white"
          lineWidth={0.5}
          dashed
          dashSize={0.25}
          gapSize={0.25}
        />
      )}
      <group ref={groupRef}>
        {visibleTimelinePoints.map((point, i) => {
          const diff = Math.min(2 * Math.max(i - (progress * (timeline.length - 1)), 0), 1);
          return <TimelinePoint point={point} key={i} diff={diff} />;
        })}
      </group>
    </group>
  );
};

export default Timeline;
