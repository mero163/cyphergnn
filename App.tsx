import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Users, 
  Network,
  ChevronRight,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Zap,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Cpu,
  Database,
  BarChart3,
  Layers,
  Sparkle,
  Terminal,
  MousePointer2,
  Code2,
  ExternalLink,
  ChevronDown,
  Target
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'motion/react';
import * as d3 from 'd3-force';
import * as d3Zoom from 'd3-zoom';
import * as d3Selection from 'd3-selection';
import 'd3-transition';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Legend,
  Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';

// --- AUDIO UTILITY ---

class SciFiAudio {
  private ctx: AudioContext | null = null;

  private init() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.error("Audio initialization failed", e);
    }
  }

  playPing() {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playProcess() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100 + Math.random() * 50, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playResult(type: string) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    if (type === 'fraud' || type === 'suspicious') {
      // Alarm/Alert sound
      [220, 165, 110].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.1, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } else {
      // Success/Clean sound
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    }
  }

  playScanStart() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

const audio = new SciFiAudio();

// --- CONSTANTS & DATA ---

const COLORS = {
  bg: '#030712',
  surface: '#0A0E1A',
  accent: '#00F2FF',
  fraud: '#FF3B3B',
  licit: '#00FF9C',
  warning: '#F59E0B',
  suspicious: '#F97316',
  uncertain: '#BC13FE',
  textPrimary: '#F1F5F9',
  textMuted: '#64748B',
};

const PERFORMANCE_DATA = [
  { name: 'Accuracy', CHAIN_AI: 92.4, GCN: 88.5, GAT: 85.2, MLP: 82.1 },
  { name: 'Precision', CHAIN_AI: 90.8, GCN: 84.2, GAT: 81.5, MLP: 78.4 },
  { name: 'Recall', CHAIN_AI: 89.5, GCN: 81.4, GAT: 79.2, MLP: 75.6 },
  { name: 'F1-Score', CHAIN_AI: 90.1, GCN: 82.8, GAT: 80.3, MLP: 77.0 },
  { name: 'ROC-AUC', CHAIN_AI: 94.2, GCN: 90.1, GAT: 88.4, MLP: 84.2 },
];

const ARCHITECTURE_STEPS = [
  { 
    id: 1, 
    title: "Graph Construction", 
    desc: "Transactions converted to directed graphs with 165 temporal features from the Elliptic dataset.", 
    icon: Network, 
    color: "text-blue-400",
    glow: "shadow-[0_0_20px_rgba(37,99,235,0.2)]"
  },
  { 
    id: 2, 
    title: "Node Embedding", 
    desc: "Feature projection and learnable embeddings mapping high-dimensional blockchain data to latent space.", 
    icon: Database, 
    color: "text-indigo-400",
    glow: "shadow-[0_0_20px_rgba(79,70,229,0.2)]"
  },
  { 
    id: 3, 
    title: "Intuitionistic Fuzzy Layer", 
    desc: "Calculating Membership (μ), Non-membership (ν), and Hesitation (π) degrees for precise uncertainty modeling.", 
    icon: Cpu, 
    color: "text-purple-400",
    glow: "shadow-[0_0_20px_rgba(147,51,234,0.2)]"
  },
  { 
    id: 4, 
    title: "Trust-Aware Message Passing", 
    desc: "Recursive neighborhood aggregation weighted by learnable fuzzy trust scores between entities.", 
    icon: Layers, 
    color: "text-cyan-400",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]"
  },
  { 
    id: 5, 
    title: "Fraud Classification", 
    desc: "Final prediction output with uncertainty bounds, providing actionable blockchain intelligence.", 
    icon: Shield, 
    color: "text-green-400",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]"
  },
];

const SAMPLES = {
  fraud_high: {
    id: "TX-230425",
    timeStep: 24,
    inDegree: 4,
    outDegree: 2,
    fraudProb: 0.87,
    licitProb: 0.13,
    mu: 0.034,
    nu: 0.890,
    pi: 0.203,
    verdict: "FRAUD DETECTED",
    verdictType: "fraud",
    confidence: 87,
    neighborhoodSize: 6,
    edges: [
      { neighbor: "TX-229100", mu: 0.031, nu: 0.925, pi: 0.044, w: 0.00, type: "fraud" },
      { neighbor: "TX-229340", mu: 0.028, nu: 0.941, pi: 0.031, w: 0.00, type: "fraud" },
      { neighbor: "TX-228750", mu: 0.062, nu: 0.812, pi: 0.126, w: 0.01, type: "fraud" },
      { neighbor: "TX-231002", mu: 0.445, nu: 0.555, pi: 0.000, w: 0.18, type: "licit" },
      { neighbor: "TX-231108", mu: 0.512, nu: 0.488, pi: 0.000, w: 0.23, type: "licit" },
      { neighbor: "TX-231200", mu: 0.381, nu: 0.619, pi: 0.000, w: 0.09, type: "licit" },
    ]
  },
  clean: {
    id: "TX-105542",
    timeStep: 12,
    inDegree: 1,
    outDegree: 2,
    fraudProb: 0.06,
    licitProb: 0.94,
    mu: 0.891,
    nu: 0.109,
    pi: 0.000,
    verdict: "CLEAN TRANSACTION",
    verdictType: "licit",
    confidence: 94,
    neighborhoodSize: 4,
    edges: [
      { neighbor: "TX-105001", mu: 0.920, nu: 0.080, pi: 0.000, w: 0.85, type: "licit" },
      { neighbor: "TX-105005", mu: 0.880, nu: 0.120, pi: 0.000, w: 0.81, type: "licit" },
      { neighbor: "TX-105110", mu: 0.940, nu: 0.060, pi: 0.000, w: 0.89, type: "licit" },
      { neighbor: "TX-105220", mu: 0.850, nu: 0.150, pi: 0.000, w: 0.78, type: "licit" },
    ]
  },
  suspicious: {
    id: "TX-884120",
    timeStep: 31,
    inDegree: 12,
    outDegree: 5,
    fraudProb: 0.71,
    licitProb: 0.29,
    mu: 0.210,
    nu: 0.650,
    pi: 0.140,
    verdict: "SUSPICIOUS ACTIVITY",
    verdictType: "suspicious",
    confidence: 71,
    neighborhoodSize: 8,
    edges: [
      { neighbor: "TX-884001", mu: 0.120, nu: 0.880, pi: 0.000, w: 0.05, type: "fraud" },
      { neighbor: "TX-884550", mu: 0.340, nu: 0.560, pi: 0.100, w: 0.15, type: "licit" },
      { neighbor: "TX-883100", mu: 0.110, nu: 0.890, pi: 0.000, w: 0.04, type: "fraud" },
      { neighbor: "TX-885002", mu: 0.250, nu: 0.750, pi: 0.000, w: 0.12, type: "licit" },
    ]
  },
  uncertain: {
    id: "TX-550912",
    timeStep: 44,
    inDegree: 3,
    outDegree: 3,
    fraudProb: 0.52,
    licitProb: 0.48,
    mu: 0.380,
    nu: 0.350,
    pi: 0.270,
    verdict: "UNCERTAIN TRIAGE",
    verdictType: "uncertain",
    confidence: 52,
    neighborhoodSize: 5,
    edges: [
      { neighbor: "TX-550100", mu: 0.310, nu: 0.290, pi: 0.400, w: 0.12, type: "licit" },
      { neighbor: "TX-550200", mu: 0.250, nu: 0.450, pi: 0.300, w: 0.08, type: "fraud" },
      { neighbor: "TX-550300", mu: 0.420, nu: 0.180, pi: 0.400, w: 0.25, type: "licit" },
    ]
  }
};

// --- BACKGROUND COMPONENTS ---

const Particles = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: Math.random() * 0.5, 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%' 
          }}
          animate={{ 
            y: [null, '-20%', '120%'],
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 20
          }}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SectionHeading = ({ subtitle, title, alignment = "center" }: { subtitle: string, title: string, alignment?: "center" | "left" }) => (
  <div className={`mb-16 ${alignment === "center" ? "text-center" : "text-left"}`}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`flex items-center gap-2 mb-4 ${alignment === "center" ? "justify-center" : ""}`}
    >
      <div className="h-px w-8 bg-cyan-500/50" />
      <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
        {subtitle}
      </span>
      <div className="h-px w-8 bg-cyan-500/50" />
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="text-5xl md:text-7xl font-black italic tracking-tighter text-shimmer leading-[1.1]"
    >
      {title}
    </motion.h2>
  </div>
);

const AnimatedNumber = ({ value, decimals = 1, suffix = '' }: { value: number, decimals?: number, suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);
  
  return <span>{displayValue.toFixed(decimals)}{suffix}</span>;
};

const ProgressBar = ({ progress, color, height = 'h-2' }: { progress: number, color: string, height?: string }) => (
  <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${height}`}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress * 100}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-full ${color}`}
    />
  </div>
);

const Badge = ({ text, type }: { text: string, type: string }) => {
  const colors: Record<string, string> = {
    high: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30',
    medium: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    low: 'bg-red-950/40 text-red-400 border-red-500/30',
    fraud: 'bg-red-900/40 text-red-100 border-red-500',
    licit: 'bg-green-900/40 text-green-100 border-green-500',
    trusted: 'bg-green-900/40 text-green-300 border-green-500/50',
    downweighted: 'bg-orange-900/40 text-orange-300 border-orange-500/50',
    suspicious: 'bg-orange-900/40 text-orange-100 border-orange-500',
    uncertain: 'bg-purple-900/40 text-purple-100 border-purple-500',
    ignored: 'bg-red-900/40 text-red-300 border-red-500/50',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider transition-all duration-300 ${colors[type] || ''}`}>
      {text}
    </span>
  );
};

// --- GRAPH COMPONENTS ---

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: string;
  label: string;
  mu?: number;
  nu?: number;
  w?: number;
  cluster?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  weight: number;
  mu: number;
  nu: number;
  type: string;
}

const GraphVisualization = ({ 
  data, 
  onNodeClick,
  analyzingNodeId,
  clusterBy = 'none' 
}: { 
  data: any, 
  onNodeClick?: (id: string) => void,
  analyzingNodeId?: string | null,
  clusterBy?: string
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGRef = useRef<SVGGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [simNodes, setSimNodes] = useState<GraphNode[]>([]);
  const [simLinks, setSimLinks] = useState<GraphLink[]>([]);
  const [isSimulationActive, setIsSimulationActive] = useState(true);

  // Removed zoom behavior as requested for fixed size
  const transform = d3Zoom.zoomIdentity;

  const connectedLinkIds = useMemo(() => {
    if (!hoveredNode) return new Set<number>();
    const ids = new Set<number>();
    simLinks.forEach((link, idx) => {
      if ((link.source as any).id === hoveredNode.id || (link.target as any).id === hoveredNode.id) {
        ids.add(idx);
      }
    });
    return ids;
  }, [hoveredNode, simLinks]);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement!.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    if (!data || dimensions.width === 0) return { nodes: [], links: [] };
    
    const nodes: GraphNode[] = [
      { id: data.id, type: 'target', label: data.id, x: dimensions.width / 2, y: dimensions.height / 2, cluster: 0 }
    ];
    
    data.edges.forEach((edge: any) => {
      let clusterId = 0;
      if (clusterBy === 'type') {
        const types = ['fraud', 'suspicious', 'uncertain', 'licit'];
        clusterId = types.indexOf(edge.type) + 1;
      } else if (clusterBy === 'risk') {
        clusterId = edge.w > 0.3 ? 1 : (edge.w > 0.05 ? 2 : 3);
      }

      nodes.push({ 
        id: edge.neighbor, 
        type: edge.type, 
        label: edge.neighbor,
        mu: edge.mu,
        nu: edge.nu,
        w: edge.w,
        cluster: clusterId
      });
    });

    const links: GraphLink[] = data.edges.map((edge: any) => ({
      source: data.id,
      target: edge.neighbor,
      weight: edge.w,
      mu: edge.mu,
      nu: edge.nu,
      type: edge.type
    }));
    
    return { nodes, links };
  }, [data, dimensions, clusterBy]);

  useEffect(() => {
    if (dimensions.width === 0 || !graphData.nodes.length) return;

    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(100) // Optimal space for fixed view
        .strength(1)
      )
      .force('charge', d3.forceManyBody().strength(-800).distanceMax(400)) // Balanced repulsion
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(80)) // Enough to prevent overlaps
      .force('x', d3.forceX(dimensions.width / 2).strength(0.4)) // Pull strongly to center
      .force('y', d3.forceY(dimensions.height / 2).strength(0.4)) // Pull strongly to center
      .velocityDecay(0.6) // More "viscous" movement, less jitter
      .alphaDecay(0.01); // Settles more slowly but smoothly

    simulation.on('tick', () => {
      setSimNodes([...simulation.nodes()]);
      setSimLinks([...graphData.links]);
      if (simulation.alpha() < 0.005) {
        setIsSimulationActive(false);
        simulation.stop();
      }
    });

    setIsSimulationActive(true);
    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions]);

  // Drag behavior
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3Selection.select(svgRef.current);
    
    // We don't implement full d3-drag here to keep it simple with React state, 
    // but the physics simulation handles the positions.
  }, []);

  const getEdgeColor = (type: string) => {
    if (type === 'fraud') return COLORS.fraud;
    if (type === 'suspicious') return COLORS.suspicious;
    if (type === 'uncertain') return COLORS.uncertain;
    return COLORS.licit;
  };

  return (
    <div className="relative w-full h-full overflow-hidden group/viz">
      <svg ref={svgRef} className="w-full h-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 242, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 242, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(0, 242, 255, 0)" />
          </linearGradient>
          <radialGradient id="gradFraud">
            <stop offset="0%" stopColor="#ff7b7b" />
            <stop offset="60%" stopColor="#ff3b3b" />
            <stop offset="100%" stopColor="#800000" />
          </radialGradient>
          <radialGradient id="gradLicit">
            <stop offset="0%" stopColor="#7fffcf" />
            <stop offset="60%" stopColor="#00ff9c" />
            <stop offset="100%" stopColor="#004d2f" />
          </radialGradient>
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feFlood floodColor="black" floodOpacity="0.5" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g ref={zoomGRef}>
          <AnimatePresence>
            {simLinks.map((link, i) => {
              const isConnected = connectedLinkIds.has(i);
              return (
                <motion.g 
                  key={`link-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {/* Glow background link */}
                  <line
                    x1={(link.source as any).x}
                    y1={(link.source as any).y}
                    x2={(link.target as any).x}
                    y2={(link.target as any).y}
                    stroke={getEdgeColor(link.type)}
                    strokeWidth={Math.max(6, link.weight * 20)}
                    strokeOpacity={isConnected ? 0.2 : 0.05}
                    className="blur-[4px] transition-all duration-300"
                  />
                  {/* Secondary link trace */}
                  <line
                    x1={(link.source as any).x}
                    y1={(link.source as any).y}
                    x2={(link.target as any).x}
                    y2={(link.target as any).y}
                    stroke={getEdgeColor(link.type)}
                    strokeWidth={Math.max(1, link.weight * 4)}
                    strokeOpacity={isConnected ? 0.4 : 0.15}
                    className="transition-all duration-300"
                  />
                  {/* Primary link */}
                  <line
                    x1={(link.source as any).x}
                    y1={(link.source as any).y}
                    x2={(link.target as any).x}
                    y2={(link.target as any).y}
                    stroke={getEdgeColor(link.type)}
                    strokeWidth={Math.max(0.5, link.weight * 2)}
                    strokeOpacity={isConnected ? 0.8 : 0.4}
                    strokeDasharray={link.weight < 0.1 ? "4 4" : "none"}
                    className="transition-all duration-300"
                  />
                  {/* Animated pulse on link */}
                  <motion.circle
                    r={isConnected ? 3.5 : 2.5}
                    fill={getEdgeColor(link.type)}
                    initial={{ cx: (link.source as any).x, cy: (link.source as any).y }}
                    animate={{ 
                      cx: [(link.source as any).x, (link.target as any).x],
                      cy: [(link.source as any).y, (link.target as any).y],
                      opacity: isConnected ? [0, 1, 0] : [0, 0.8, 0]
                    }}
                    transition={{ 
                      duration: 2.5 / Math.max(0.2, link.weight), 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: (i * 0.15) % 2
                    }}
                    className="pointer-events-none filter blur-[0.5px]"
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {simNodes.map((node, i) => (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: hoveredNode && hoveredNode.id !== node.id ? 'grayscale(0.5) opacity(0.3)' : 'none'
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 20,
                  delay: i * 0.05
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  audio.playPing();
                  onNodeClick?.(node.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="cursor-pointer group/node focus:outline-none"
              >
                <circle
                  cx={node.x || 0}
                  cy={node.y || 0}
                  tabIndex={-1}
                  r={node.type === 'target' ? 22 : 12}
                  fill={COLORS.accent}
                  filter="url(#nodeShadow)"
                  className="transition-all duration-300 group-hover/node:brightness-125 group-active/node:scale-90"
                  stroke={hoveredNode?.id === node.id ? "white" : "rgba(255,255,255,0.4)"}
                  strokeWidth={hoveredNode?.id === node.id ? 4 : 1.5}
                  pointerEvents="all"
                />
                {node.type === 'target' && (
                  <g>
                    <circle
                      cx={node.x || 0}
                      cy={node.y || 0}
                      r={28}
                      fill="none"
                      stroke={COLORS.accent}
                      strokeWidth={1}
                      className="animate-pulse"
                      strokeDasharray="5 5"
                      pointerEvents="none"
                    />
                    <motion.circle
                      cx={node.x || 0}
                      cy={node.y || 0}
                      r={35}
                      fill="none"
                      stroke={COLORS.accent}
                      strokeWidth={0.5}
                      strokeOpacity={0.3}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      pointerEvents="none"
                    />
                  </g>
                )}
                {analyzingNodeId === node.id && (
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 2.5], opacity: [1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    cx={node.x || 0}
                    cy={node.y || 0}
                    r={25}
                    fill="none"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                )}
              </motion.g>
            ))}
          </AnimatePresence>
        </g>
      </svg>

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute p-3 glass-card rounded-lg border border-white/20 pointer-events-none z-30"
            style={{ 
              left: Math.min(hoveredNode.x! + 15, dimensions.width - 150), 
              top: Math.min(hoveredNode.y! + 15, dimensions.height - 100) 
            }}
          >
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-mono text-gray-400">ID: {hoveredNode.id}</div>
              <div className="text-xs font-bold uppercase">{hoveredNode.type}</div>
              {hoveredNode.type !== 'target' && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 border-t border-white/10 pt-2 font-mono text-[9px]">
                  <div>μ: {hoveredNode.mu?.toFixed(3)}</div>
                  <div>ν: {hoveredNode.nu?.toFixed(3)}</div>
                  <div className="col-span-2">w: {hoveredNode.w?.toFixed(3)}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SECTIONS ---

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full h-20 z-[100] flex items-center justify-between px-8 md:px-12 transition-all duration-500 ${scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/10 h-16" : "bg-transparent h-24"}`}>
      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center group-hover:neon-border-blue transition-all">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="absolute -inset-1 bg-cyan-500/20 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter italic leading-none uppercase text-white">ChainForensics AI</h1>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400/60">Quantum Core</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-10">
        {['Architecture', 'Simulation', 'Performance', 'Explainability'].map((item) => (
          <button 
            key={item} 
            onClick={() => scrollTo(item.toLowerCase())}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-cyan-400 transition-all relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 transition-all group-hover:w-full" />
          </button>
        ))}
        <button className="px-6 py-2 rounded-full bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          Whitepaper
        </button>
      </nav>

      <button className="md:hidden w-10 h-10 glass-card rounded-lg flex items-center justify-center">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
    </header>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 300]);
  const y2 = useTransform(scrollY, [0, 800], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-8 overflow-hidden bg-black">
      {/* Background Cinematic Layers */}
      <div className="absolute inset-0 z-0">
        <Particles />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/0 via-[#030712]/50 to-[#030712]" />
        <div className="grid-pattern absolute inset-0 opacity-40" />
        
        {/* Floating Abstract Shapes */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute top-[20%] left-[10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          style={{ y: y1 }}
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" 
        />
      </div>

      <motion.div 
        style={{ y: springY1, opacity, scale }}
        className="relative z-10 text-center max-w-5xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-[0_0_30px_rgba(0,242,255,0.1)]"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Neural Integrity Protocol Active
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-7xl md:text-[9rem] font-black italic tracking-tighter leading-[0.8] mb-10 text-shimmer"
        >
          TRUST <span className="text-white">COGNITION</span> <br /> 
          <span className="text-cyan-500">CYBER</span> FRAUD
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-2xl text-gray-400 font-light max-w-3xl mx-auto mb-16 leading-relaxed px-4"
        >
          Next-generation <span className="text-white font-bold italic tracking-tight">Explainable AI</span> platform leveraging <span className="text-cyan-400 font-medium">Intuitionistic Fuzzy Graph Neural Networks</span> to deconstruct blockchain anomalies with surgical precision.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          <button 
            onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-10 py-5 rounded-full overflow-hidden bg-white text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initiate Discovery <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
          <button 
            onClick={() => document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-10 py-5 rounded-full bg-transparent border border-white/20 text-white font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all flex items-center gap-3"
          >
            Real-time HUD <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-600 animate-pulse">Interface Descent</span>
        <div className="w-px h-16 bg-gradient-to-b from-cyan-500 via-cyan-500/50 to-transparent" />
      </motion.div>
    </section>
  );
};

const Architecture = () => (
  <section id="architecture" className="py-32 px-8 max-w-7xl mx-auto">
    <SectionHeading 
      subtitle="The Intelligence Pipeline"
      title="IF-GNN ARCHITECTURE"
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div className="space-y-4">
        {ARCHITECTURE_STEPS.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group glass-card p-6 rounded-2xl flex items-start gap-6 hover:border-cyan-500/50 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center shrink-0 ${step.color}`}>
              <step.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors uppercase italic">
                {idx + 1}. {step.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group/diag overflow-hidden"
      >
        <div className="absolute inset-0 bg-cyan-500/10 rounded-[2rem] blur-[100px] group-hover/diag:bg-cyan-500/20 transition-all duration-1000" />
        
        <div className="relative glass-card rounded-[2.5rem] p-8 border border-white/10 flex flex-col gap-8 bg-black/60">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-2 h-8 bg-cyan-400 rounded-full" />
               <h3 className="text-xl font-black italic tracking-tighter">NEURAL PIPELINE</h3>
             </div>
             <div className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full animate-pulse border border-cyan-400/20">
               CORE VERSION 3.1-LITE
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input Phase */}
            <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-3">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stage 01: Input</div>
              <div className="flex flex-col gap-2">
                <div className="h-12 w-full rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400">Transaction Graph X, A</div>
              </div>
            </div>

             {/* IF Layer */}
             <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-3">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stage 02: IF Layer</div>
              <div className="flex flex-col gap-2">
                <div className="h-12 w-full rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-mono text-[10px] text-cyan-400">
                  f(μ, ν, π)
                </div>
                <div className="text-[10px] font-mono text-gray-400">Intuitionistic Fuzzy Logic</div>
              </div>
            </div>

            {/* Message Passing */}
            <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-3">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stage 03: Aggregation</div>
              <div className="flex flex-col gap-2 relative">
                <div className="h-12 w-full rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-cyan-400" />
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <div className="w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400" />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400">Trust-Aware Propagation</div>
              </div>
            </div>

            {/* Classification */}
            <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-3">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stage 04: Classifier</div>
              <div className="flex flex-col gap-2">
                <div className="h-12 w-full rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-mono text-[10px] text-white">
                  SOFTMAX
                </div>
                <div className="text-[10px] font-mono text-gray-400">Fraud Prob. p ∈ [0,1]</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase italic">Key Innovation</div>
              <div className="text-[10px] text-gray-400 leading-tight">Integrating Intuitionistic Fuzzy Logic with GNNs to model explicit trust and uncertainty.</div>
            </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none border-[10px] border-white/5 rounded-[2.5rem] mix-blend-overlay" />
        </div>
      </motion.div>
    </div>
  </section>
);

const Simulation = ({ selectedTx, simulateAnalysis, isSimulating, analyzingNodeId, forensicReport, clusterBy, setClusterBy, getTransactionData }: any) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  const [activeNodes, setActiveNodes] = useState([
    { id: 'TX-230425', type: 'fraud', label: 'Fraud Cluster A' },
    { id: 'TX-105542', type: 'licit', label: 'Exchange HotLink' },
    { id: 'TX-884120', type: 'suspicious', label: 'Anomalous Loop' },
    { id: 'TX-550912', type: 'uncertain', label: 'Mixed Triage' },
    { id: 'TX-990211', type: 'licit', label: 'Valid Merchant' },
    { id: 'TX-440122', type: 'fraud', label: 'Shadow Sweep' },
  ]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return activeNodes;
    return activeNodes.filter(node => 
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      node.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeNodes]);

  const performSearch = (id: string) => {
    if (isSimulating) return;
    const normalizedId = id.trim().toUpperCase();
    const tx = getTransactionData(normalizedId);
    // Add to active nodes if not present
    if (!activeNodes.find(n => n.id === tx.id)) {
      setActiveNodes(prev => [
        { id: tx.id, type: tx.verdictType, label: 'Neural Probe Search' },
        ...prev
      ].slice(0, 10));
    }
    simulateAnalysis(tx);
    setSearchQuery('');
  };

  useEffect(() => {
    if (isSimulating) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] INITIATING NEURAL PROBE: ${selectedTx.id}`]);
      const int = setInterval(() => {
        const msgs = [
          "EXTRACTING TEMPORAL FEATURES...",
          "MAPPING NEIGHBORHOOD TOPOLOGY...",
          "SOLVING FUZZY MEMBERSHIPS (μ, ν, π)...",
          "AGGREGATING TRUST SCORES...",
          "STABILIZING PREDICTION VECTOR..."
        ];
        setLogs(prev => [...prev, `[LOG] ${msgs[Math.floor(Math.random() * msgs.length)]}`]);
      }, 300);
      return () => clearInterval(int);
    }
  }, [isSimulating, selectedTx.id]);

  useEffect(() => {
    if (logEndRef.current && logEndRef.current.parentElement) {
      const container = logEndRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  return (
    <section id="simulation" className="py-32 px-8 bg-[#030712] relative min-h-[1100px] overflow-anchor-none">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto">
        <SectionHeading 
          subtitle="Interactive HUD"
          title="SYNTHETIC INFERENCE"
        />

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          {/* Left Control Panel */}
          <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-8">
             {/* Search Panel */}
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="glass-card p-8 rounded-[2rem] border-white/5"
             >
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                    <Search className="w-4 h-4" /> Node Registry
                  </h4>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>
                          <div className="relative mb-8 group">
                   <input 
                     type="text" 
                     placeholder={isSimulating ? "NEURAL ANALYSIS IN PROGRESS..." : "Search Matrix..."}
                     value={searchQuery}
                     disabled={isSimulating}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 font-mono text-xs focus:outline-none transition-all uppercase tracking-widest ${
                       isSimulating ? 'border-cyan-500/50 text-cyan-400 placeholder:text-cyan-500/30' : 'border-white/10 focus:border-cyan-500 group-hover:border-white/20'
                     }`}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         performSearch(searchQuery || "TX-RANDOM");
                       }
                     }}
                   />
                   {isSimulating ? (
                     <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
                   ) : (
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                   )}
                   
                   {/* Search Suggestion Overlay */}
                   <AnimatePresence>
                     {searchQuery && (
                       <motion.div 
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="absolute top-full left-0 w-full mt-2 glass-card rounded-2xl border-white/10 z-[60] overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar"
                       >
                         {filteredNodes.length > 0 ? (
                           filteredNodes.map((node) => (
                             <button
                               key={node.id}
                               onClick={() => performSearch(node.id)}
                               className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all group/item text-left border-b border-white/5 last:border-0"
                             >
                               <div>
                                 <div className="text-xs font-mono font-bold text-white group-hover/item:text-cyan-400 transition-colors">{node.id}</div>
                                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">{node.label}</div>
                               </div>
                               <Badge text={node.type} type={node.type} />
                             </button>
                           ))
                         ) : (
                           <div className="px-6 py-8 text-center">
                             <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 italic">No matching matrix data</div>
                             <button 
                               onClick={() => performSearch(searchQuery)}
                               className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-black"
                             >
                               Force Analysis of "{searchQuery}"
                             </button>
                           </div>
                         )}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
                
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4 italic px-2">Active Probes</div>
                  {activeNodes.slice(0, 4).map((node) => (
                    <motion.button 
                      key={node.id}
                      whileHover={{ x: 5 }}
                      onClick={() => performSearch(node.id)}
                      className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-between group/node hover:border-cyan-500/30 transition-all relative overflow-hidden"
                    >
                      {analyzingNodeId === node.id && (
                        <motion.div 
                          layoutId="scanning-bg"
                          className="absolute inset-0 bg-cyan-500/10"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 ${
                          analyzingNodeId === node.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-black/40 text-gray-500'
                        }`}>
                          <Activity className={`w-4 h-4 ${analyzingNodeId === node.id ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="text-left">
                          <div className="text-[11px] font-mono font-bold text-white tracking-tight">{node.id}</div>
                          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{node.label}</div>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {analyzingNodeId === node.id ? (
                          <div className="flex gap-1">
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
                          </div>
                        ) : (
                          <Badge text={node.type} type={node.type} />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

             {/* Result Panel */}
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="glass-card p-8 rounded-[2rem] flex-1 relative overflow-hidden group border-white/5"
             >
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700">
                  <Shield className="w-16 h-16 text-cyan-400" />
                </div>
                
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Core Triage</h4>
                  <Badge text="Quantum Stabilized" type="high" />
                </div>
                
                <div className="text-center py-4 border-b border-white/5 mb-8">
                  <motion.div 
                    key={selectedTx.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-4xl md:text-5xl font-black italic tracking-tighter mb-4 terminal-glow ${
                      selectedTx.verdictType === 'fraud' ? 'text-red-500' : 
                      selectedTx.verdictType === 'licit' ? 'text-green-400' : 
                      selectedTx.verdictType === 'suspicious' ? 'text-orange-400' : 'text-purple-400'
                    }`}
                  >
                    {selectedTx.verdict}
                  </motion.div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-mono font-bold leading-none">
                      <AnimatedNumber value={selectedTx.confidence} decimals={0} />
                    </span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Conf. Score</span>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
                        <span>Fraud Potential</span>
                        <span className="text-red-500">{(selectedTx.fraudProb * 100).toFixed(1)}%</span>
                      </div>
                      <ProgressBar progress={selectedTx.fraudProb} color="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
                        <span>Licit Trust</span>
                        <span className="text-green-500">{(selectedTx.licitProb * 100).toFixed(1)}%</span>
                      </div>
                      <ProgressBar progress={selectedTx.licitProb} color="bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                   </div>
                </div>

                {/* Log Viewport */}
                <div className="mt-10 bg-black/40 rounded-xl p-4 h-32 overflow-y-auto no-scrollbar border border-white/5 font-mono text-[9px] text-cyan-400/60 lowercase italic leading-relaxed">
                   {logs.map((log, i) => (
                     <div key={i} className="mb-1">{log}</div>
                   ))}
                   <div ref={logEndRef} />
                </div>
             </motion.div>
          </div>

          {/* Right Layout: Topology & Statistics */}
          <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:h-[550px]">
              {/* Topology View */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="glass-card rounded-[3rem] relative overflow-hidden border-white/5 min-h-[450px]"
              >
                <div className="absolute top-8 left-8 z-20 flex flex-wrap items-center gap-4">
                   <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-black/60 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] backdrop-blur-md">
                     <Network className="w-4 h-4 text-cyan-400" /> Topology Matrix
                   </div>
                </div>

                <div className="w-full h-full p-6">
                   <GraphVisualization 
                     data={selectedTx} 
                     clusterBy={clusterBy} 
                     analyzingNodeId={analyzingNodeId}
                     onNodeClick={(id) => simulateAnalysis(getTransactionData(id))} 
                   />
                </div>

                <AnimatePresence>
                  {isSimulating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[30] bg-[#030712]/90 backdrop-blur-3xl flex flex-col items-center justify-center"
                    >
                      <div className="relative w-48 h-48 mb-8">
                        <motion.div 
                          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                          transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                          className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-cyan-400 border-r-transparent"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Shield className="w-12 h-12 text-cyan-400 glow-cyan animate-pulse shadow-[0_0_30px_rgba(0,242,255,0.2)]" />
                        </div>
                      </div>
                      <div className="font-mono text-cyan-400 text-[10px] tracking-[0.8em] animate-pulse uppercase italic font-black">DECRYPTING</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Forensic Intelligence (Gemini) */}
              <motion.div 
                 id="forensic-report-panel"
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="glass-card rounded-[3rem] p-8 border-white/5 relative overflow-hidden flex flex-col min-h-[450px]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> AI Forensic Report
                  </h4>
                  <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[8px] font-black text-purple-400 uppercase tracking-widest">
                    Expert Review
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                  {isSimulating ? (
                    <div className="space-y-4 pt-4">
                      <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                    </div>
                  ) : forensicReport ? (
                    <div className="markdown-body font-mono text-[11px] text-gray-300 leading-relaxed space-y-4 selection:bg-purple-500/30">
                      <ReactMarkdown>{forensicReport}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Code2 className="w-12 h-12 mb-4 text-gray-600" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Select a node to generate <br /> expert forensic report</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
               {[
                 { label: "Degree (In/Out)", val: `${selectedTx.inDegree} / ${selectedTx.outDegree}`, icon: Network, color: "text-blue-400" },
                 { label: "Trust Index (W)", val: selectedTx.edges[0]?.w.toFixed(3) || "0.000", icon: Activity, color: "text-green-400" },
                 { label: "Stability Factor", val: "α-99.2", icon: Target, color: "text-purple-400" },
                 { label: "Uncertainty (π)", val: selectedTx.pi?.toFixed(3) || "0.000", icon: HelpCircle, color: "text-orange-400" }
               ].map((stat, i) => (
                 <div key={i} className="glass-card p-6 rounded-3xl border-white/5 hover:border-cyan-500/30 transition-all flex flex-col items-center text-center group">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{stat.label}</div>
                    <div className="text-xl font-mono font-bold tracking-tight text-white">{stat.val}</div>
                 </div>
               ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Performance = () => (
  <section id="performance" className="py-32 px-8 max-w-7xl mx-auto">
    <SectionHeading 
      subtitle="Model Evaluation"
      title="RESEARCH BENCHMARKS"
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <div className="glass-card p-8 rounded-[2rem]">
        <h3 className="text-xl font-bold mb-8 uppercase tracking-widest italic flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-cyan-400" /> Comparison Metrics
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PERFORMANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #ffffff15' }} />
              <Bar dataKey="CHAIN_AI" fill="#00F2FF" radius={[4, 4, 0, 0]} name="Chain AI" />
              <Bar dataKey="GCN" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2rem]">
        <h3 className="text-xl font-bold mb-8 uppercase tracking-widest italic flex items-center gap-3">
          <Activity className="w-5 h-5 text-purple-400" /> Training Curve
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { epoch: 0, acc: 0.5 },
              { epoch: 10, acc: 0.72 },
              { epoch: 20, acc: 0.85 },
              { epoch: 30, acc: 0.90 },
              { epoch: 50, acc: 0.924 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #ffffff15' }} />
              <Line type="monotone" dataKey="acc" stroke="#BC13FE" strokeWidth={3} dot={{ fill: '#BC13FE' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </section>
);

const Explainability = () => (
  <section id="explainability" className="py-32 px-8 max-w-7xl mx-auto">
    <SectionHeading 
      subtitle="Behind the Prediction"
      title="EXPLAINABLE AI (XAI)"
    />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass-card p-8 rounded-[2rem]">
        <h3 className="text-xl font-bold mb-6 uppercase tracking-widest italic flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-400" /> Fuzzy Membership Evolution
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { step: 0, mu: 0.1, nu: 0.8 },
              { step: 1, mu: 0.25, nu: 0.6 },
              { step: 2, mu: 0.45, nu: 0.4 },
              { step: 3, mu: 0.75, nu: 0.15 },
              { step: 4, mu: 0.88, nu: 0.05 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="step" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #ffffff15' }} />
              <Area type="monotone" dataKey="mu" stackId="1" stroke="#00FF9C" fill="#00FF9C" fillOpacity={0.3} />
              <Area type="monotone" dataKey="nu" stackId="1" stroke="#FF3B3B" fill="#FF3B3B" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        {[
          { icon: HelpCircle, title: "Hesitation (π)", desc: "Quantifying unknown variables in transaction topology." },
          { icon: Shield, title: "Trust Scores (w)", desc: "Weighted aggregation based on learnable trust logic." },
          { icon: Zap, title: "Intuitionistic Logic", desc: "Modeling non-binary boundaries of illicit activity." }
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <item.icon className="w-8 h-8 text-cyan-400 mb-4" />
            <h4 className="text-lg font-bold uppercase mb-2 italic tracking-tight">{item.title}</h4>
            <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Impact = () => (
  <section className="py-32 px-8 max-w-7xl mx-auto text-center">
    <SectionHeading 
      subtitle="Why it matters"
      title="RESEARCH IMPACT"
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="space-y-4">
        <div className="text-5xl font-black text-cyan-400 font-mono">92%</div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Reduction in False Positives</p>
      </div>
      <div className="space-y-4">
        <div className="text-5xl font-black text-purple-400 font-mono">1.2s</div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Real-time Analysis</p>
      </div>
      <div className="space-y-4">
        <div className="text-5xl font-black text-indigo-400 font-mono">100%</div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Decision Traceability</p>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 px-8 border-t border-white/5">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">ChainForensics AI</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Quantum intelligence © 2024</p>
        </div>
      </div>

      <div className="flex items-center gap-8 text-gray-400">
        <a href="https://github.com/mero163" target="_blank" rel="noopener noreferrer">
          <Github className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
        </a>
        <a href="mailto:maryalaa313@gmail.com">
          <Mail className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
        </a>
        <a href="https://www.linkedin.com/in/mary-alaa-103965301" target="_blank" rel="noopener noreferrer">
          <Linkedin className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
        </a>
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 text-center md:text-right">
        Built for Bitcoin Fraud Detection <br /> 
        <span className="text-cyan-500/50">Developed by Mary Alaa</span>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [selectedTx, setSelectedTx] = useState(SAMPLES.fraud_high);
  const [isSimulating, setIsSimulating] = useState(false);
  const [analyzingNodeId, setAnalyzingNodeId] = useState<string | null>(null);
  const [forensicReport, setForensicReport] = useState<string | null>(null);
  const [clusterBy, setClusterBy] = useState('none');

  const getTransactionData = useCallback((id: string) => {
    const idNum = parseInt(id.replace(/\D/g, '')) || 1000;
    const isFraud = idNum % 5 === 0;
    const isSuspicious = idNum % 7 === 0 && !isFraud;
    
    const verdictType = isFraud ? "fraud" : (isSuspicious ? "suspicious" : "licit");
    const verdict = isFraud ? "FRAUD DETECTED" : (isSuspicious ? "SUSPICIOUS ACTIVITY" : "CLEAN TRANSACTION");
    const confidence = 75 + (idNum % 24);

    return {
      id: id.startsWith('TX-') ? id : `TX-${idNum}`,
      timeStep: idNum % 50,
      inDegree: (idNum % 10) + 1,
      outDegree: (idNum % 5) + 1,
      fraudProb: isFraud ? 0.82 + (idNum % 15) / 100 : (isSuspicious ? 0.65 : 0.05 + (idNum % 10) / 100),
      licitProb: isFraud ? 0.05 + (idNum % 10) / 100 : (isSuspicious ? 0.25 : 0.85 + (idNum % 15) / 100),
      mu: isFraud ? 0.1 : 0.8,
      nu: isFraud ? 0.8 : 0.1,
      pi: 0.1,
      verdict,
      verdictType,
      confidence,
      edges: Array.from({ length: 6 }).map((_, i) => {
        const nIdNum = idNum + i + 1000;
        const isNFraud = nIdNum % 5 === 0;
        const isNSuspicious = nIdNum % 7 === 0 && !isNFraud;
        const nType = isNFraud ? "fraud" : (isNSuspicious ? "suspicious" : "licit");
        
        return {
          neighbor: `TX-${nIdNum}`,
          mu: Math.random(),
          nu: Math.random(),
          pi: Math.random() * 0.2,
          w: Math.random(),
          type: nType
        };
      })
    };
  }, []);

  const simulateAnalysis = async (tx: any) => {
    if (!tx || isSimulating) return;
    console.log("Simulating analysis for:", tx.id);
    
    setAnalyzingNodeId(tx.id);
    audio.playScanStart();
    setIsSimulating(true);
    setForensicReport(null);
    
    // Simulate audio processing "beeps"
    const processInterval = setInterval(() => {
      audio.playProcess();
    }, 200);
    
    try {
      // Start Gemini analysis in parallel with UI simulation
      const analysisPromise = fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txData: tx })
      }).then(r => r.json());

      setTimeout(async () => {
        clearInterval(processInterval);
        setSelectedTx(tx);
        setIsSimulating(false);
        setAnalyzingNodeId(null);
        
        console.log("Show result for:", tx.id, tx.verdictType);
        // Play result sound based on outcome
        audio.playResult(tx.verdictType);

        try {
          const result = await analysisPromise;
          if (result.report) {
            setForensicReport(result.report);
          } else if (result.error) {
            setForensicReport(`### ANALYSIS OVERLOAD\n${result.error}`);
          }
        } catch (e) {
          console.error("Forensic analysis failed", e);
          setForensicReport("### ANALYSIS ERROR\nCritical failure in neural uplink. Attempt reconnection in T-minus 60 seconds.");
        }
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsSimulating(false);
      clearInterval(processInterval);
    }
  };

  return (
    <div className="bg-[#030712] text-white selection:bg-cyan-500/30 font-sans">
      <div className="scanline" />
      <Nav />
      <Hero />
      <div className="relative z-10 bg-[#030712]">
        <Architecture />
        <Simulation 
          selectedTx={selectedTx} 
          simulateAnalysis={simulateAnalysis} 
          isSimulating={isSimulating}
          analyzingNodeId={analyzingNodeId}
          forensicReport={forensicReport}
          clusterBy={clusterBy}
          setClusterBy={setClusterBy}
          getTransactionData={getTransactionData}
        />
        <Performance />
        <Explainability />
        <Impact />
        <Footer />
      </div>
    </div>
  );
}
