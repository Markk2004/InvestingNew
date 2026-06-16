import { useRef, useCallback, useState, useMemo } from "react";
import { Application, Container, Graphics, Text, type Texture } from "pixi.js";
import type { Agent, Department, SubAgent, Task, MeetingPresence } from "@/lib/agents";
import { useOfficePixiRuntime } from "./useOfficePixiRuntime";
import { buildOfficeScene } from "./buildScene";
import type { Delivery, RoomRect, SubCloneBurstParticle, WallClockVisual } from "./model";
import type { AnimItem, BreakAnimItem, SubCloneAnimItem, DataSnapshot } from "./buildScene-types";

interface UseOfficeSetupParams {
  departments: Department[];
  agents: Agent[];
  tasks: Task[];
  subAgents: SubAgent[];
  unreadAgentIds?: Set<string>;
  onSelectAgent?: (agent: Agent) => void;
  onSelectDepartment?: (dept: Department) => void;
}

export function useOfficeSetup({
  departments,
  agents,
  tasks,
  subAgents,
  unreadAgentIds,
  onSelectAgent,
  onSelectDepartment
}: UseOfficeSetupParams) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const texturesRef = useRef<Record<string, Texture>>({});
  const destroyedRef = useRef<boolean>(false);
  const initIdRef = useRef<number>(0);
  const initDoneRef = useRef<boolean>(false);
  const officeWRef = useRef<number>(1000);
  const scrollHostXRef = useRef<HTMLElement | null>(null);
  const scrollHostYRef = useRef<HTMLElement | null>(null);
  const deliveriesRef = useRef<Delivery[]>([]);
  
  const cbRef = useRef({
    onSelectAgent: onSelectAgent || (() => {}),
    onSelectDepartment: onSelectDepartment || (() => {}),
  });
  cbRef.current.onSelectAgent = onSelectAgent || (() => {});
  cbRef.current.onSelectDepartment = onSelectDepartment || (() => {});

  const dataRef = useRef<DataSnapshot>({
    departments,
    agents,
    tasks,
    subAgents,
    unreadAgentIds: unreadAgentIds ?? new Set(),
    meetingPresence: [],
  });
  dataRef.current = { departments, agents, tasks, subAgents, unreadAgentIds };

  const [sceneRevision, setSceneRevision] = useState(0);

  const activeMeetingTaskIdRef = useRef<string | null>(null);
  const meetingMinutesOpenRef = useRef<((taskId: string) => void) | undefined>(undefined);
  const localeRef = useRef<"en" | "th" | "zh" | "ja" | "ko">("en");
  const themeRef = useRef<"light" | "dark">("dark");

  const animItemsRef = useRef<AnimItem[]>([]);
  const roomRectsRef = useRef<RoomRect[]>([]);
  const deliveryLayerRef = useRef<Container | null>(null);
  const prevAssignRef = useRef<Set<string>>(new Set());
  const agentPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const spriteMapRef = useRef<Map<string, number>>(new Map());
  const ceoMeetingSeatsRef = useRef<Array<{ x: number; y: number }>>([]);
  const totalHRef = useRef<number>(0);
  const ceoPosRef = useRef<{ x: number; y: number }>({ x: 180, y: 60 });
  const ceoSpriteRef = useRef<Container | null>(null);
  const crownRef = useRef<Text | null>(null);
  const highlightRef = useRef<Graphics | null>(null);
  const ceoOfficeRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const breakRoomRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const breakAnimItemsRef = useRef<BreakAnimItem[]>([]);
  const subCloneAnimItemsRef = useRef<SubCloneAnimItem[]>([]);
  const subCloneBurstParticlesRef = useRef<SubCloneBurstParticle[]>([]);
  const subCloneSnapshotRef = useRef<Map<string, { parentAgentId: string; x: number; y: number }>>(new Map());
  const breakSteamParticlesRef = useRef<Container | null>(null);
  const breakBubblesRef = useRef<Container[]>([]);
  const wallClocksRef = useRef<WallClockVisual[]>([]);
  const wallClockSecondRef = useRef<number>(-1);

  const tickRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const cliUsageRef = useRef<Record<string, any> | null>(null);
  const themeHighlightTargetIdRef = useRef<string | null>(null);

  const followCeoInView = useCallback(() => {
    // Basic implementation for scrolling to CEO
    const scrollX = scrollHostXRef.current;
    const scrollY = scrollHostYRef.current;
    if (scrollX && ceoPosRef.current) {
        scrollX.scrollLeft = ceoPosRef.current.x - scrollX.clientWidth / 2;
    }
    if (scrollY && ceoPosRef.current) {
        scrollY.scrollTop = ceoPosRef.current.y - scrollY.clientHeight / 2;
    }
  }, []);

  const triggerDepartmentInteract = useCallback(() => {}, []);

  const buildScene = useCallback(() => {
    buildOfficeScene({
      appRef,
      texturesRef,
      dataRef,
      cbRef,
      activeMeetingTaskIdRef,
      meetingMinutesOpenRef,
      localeRef,
      themeRef,
      animItemsRef,
      roomRectsRef,
      deliveriesRef,
      deliveryLayerRef,
      prevAssignRef,
      agentPosRef,
      spriteMapRef,
      ceoMeetingSeatsRef,
      totalHRef,
      officeWRef,
      ceoPosRef,
      ceoSpriteRef,
      crownRef,
      highlightRef,
      ceoOfficeRectRef,
      breakRoomRectRef,
      breakAnimItemsRef,
      subCloneAnimItemsRef,
      subCloneBurstParticlesRef,
      subCloneSnapshotRef,
      breakSteamParticlesRef,
      breakBubblesRef,
      wallClocksRef,
      wallClockSecondRef,
      setSceneRevision,
    });
  }, []);

  const tickerContext = useMemo(() => ({
    tickRef,
    keysRef,
    ceoPosRef,
    ceoSpriteRef,
    crownRef,
    highlightRef,
    animItemsRef,
    cliUsageRef,
    roomRectsRef,
    deliveriesRef,
    breakAnimItemsRef,
    subCloneAnimItemsRef,
    subCloneBurstParticlesRef,
    breakSteamParticlesRef,
    breakBubblesRef,
    wallClocksRef,
    wallClockSecondRef,
    themeHighlightTargetIdRef,
    ceoOfficeRectRef,
    breakRoomRectRef,
    officeWRef,
    totalHRef,
    dataRef,
    followCeoInView,
  }), [followCeoInView]);


  useOfficePixiRuntime({
    containerRef,
    appRef,
    texturesRef,
    destroyedRef,
    initIdRef,
    initDoneRef,
    officeWRef,
    scrollHostXRef,
    scrollHostYRef,
    deliveriesRef,
    dataRef,
    buildScene,
    followCeoInView,
    triggerDepartmentInteract,
    keysRef,
    tickerContext,
    departments,
    agents,
    tasks,
    subAgents,
    language: "en",
    currentTheme: "dark",
  });

  return {
    containerRef,
    keysRef,
    sceneRevision
  };
}
