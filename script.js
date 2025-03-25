// MG1999 Probability Simulator
// Main JavaScript code

// ================================
// Utility Functions
// ================================

// Simulate a dice roll (1-6)
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Simulate a coin flip (Heads or Tails)
function flipCoin() {
  return Math.random() > 0.5 ? 'Heads' : 'Tails';
}

// Simulate a wheel spin (1-8)
function spinWheel() {
  return Math.floor(Math.random() * 8) + 1;
}

// Format relative time (e.g., "2m ago")
function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Get icon for simulation type
function getIconClass(type) {
  switch (type) {
    case 'dice': return 'fa-dice';
    case 'coin': return 'fa-coins';
    case 'wheel': return 'fa-sync-alt';
    default: return 'fa-question';
  }
}

// Get label for simulation type
function getTypeLabel(type) {
  switch (type) {
    case 'dice': return 'Dice Roll';
    case 'coin': return 'Coin Flip';
    case 'wheel': return 'Wheel Spin';
    default: return 'Unknown';
  }
}

// Haptic feedback (vibration)
function vibrate(pattern) {
  if (!navigator.vibrate) return;
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.error('Error triggering vibration:', error);
  }
}

// ================================
// Sound Management
// ================================

// Sound data
const SOUNDS = {
  'roll': '/sounds/dice-roll.mp3',
  'flip': '/sounds/coin-flip.mp3',
  'impact': '/sounds/impact.mp3',
  'wheel-spin': '/sounds/wheel-spin.mp3',
  'wheel-tick': '/sounds/wheel-tick.mp3',
  'wheel-stop': '/sounds/wheel-stop.mp3'
};

// Global sound state
let soundEnabled = true;

// Toggle sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById('soundToggle').innerHTML = soundEnabled 
    ? '<i class="fas fa-volume-up text-[#7C4DFF]"></i>' 
    : '<i class="fas fa-volume-mute text-gray-400"></i>';
  
  // Save preference to localStorage
  localStorage.setItem('soundEnabled', soundEnabled.toString());
  
  vibrate(20);
}

// Play sound
function playSound(type) {
  if (!soundEnabled) return;
  
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.7;
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// ================================
// Core Data Structure & State
// ================================

// Main data store for simulation history
let simulations = [];
let activeTab = 'dice'; // 'dice', 'coin', or 'wheel'
let activeStatsTab = 'dice';
let isAnimating = false;
let wheelColors = [
  '#F44336', // Red
  '#FF9800', // Orange
  '#FFEB3B', // Yellow
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#009688'  // Teal
];
let wheelResults = [
  "Red (1)", "Orange (2)", "Yellow (3)", "Green (4)",
  "Blue (5)", "Purple (6)", "Pink (7)", "Teal (8)"
];
let clickInterval = null;

// ================================
// Dice Simulation
// ================================

function setupDice() {
  const diceFaces = document.querySelectorAll('.dice-face');
  const size = 100; // dice size in px
  
  // Position each face correctly in 3D space
  diceFaces.forEach((face, index) => {
    let transform = '';
    
    switch (index) {
      case 0: // Front (1)
        transform = `translateZ(${size / 2}px)`;
        break;
      case 1: // Back (6)
        transform = `translateZ(${-size / 2}px) rotateY(180deg)`;
        break;
      case 2: // Top (2)
        transform = `translateY(${-size / 2}px) rotateX(90deg)`;
        break;
      case 3: // Bottom (5)
        transform = `translateY(${size / 2}px) rotateX(-90deg)`;
        break;
      case 4: // Right (3)
        transform = `translateX(${size / 2}px) rotateY(90deg)`;
        break;
      case 5: // Left (4)
        transform = `translateX(${-size / 2}px) rotateY(-90deg)`;
        break;
    }
    
    face.style.transform = transform;
  });
}

function animateDice() {
  const dice = document.getElementById('dice');
  if (!dice || isAnimating) return;
  
  isAnimating = true;
  document.getElementById('diceResult').textContent = '?';
  
  // Pre-determine the result to ensure consistency
  const randomResult = rollDice();
  
  // Play dice rolling sound
  playSound('roll');
  
  // Apply vibration pattern for rolling dice
  vibrate([20, 30, 20, 30, 40]);
  
  // Animation setup
  const startTime = Date.now();
  const duration = 1500; // 1.5 seconds
  
  // Remove any existing transition
  dice.style.transition = 'none';
  
  // Animation function
  function animate() {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Animation timing function - ease out as time passes
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOut(progress);
    
    // Rotate faster at beginning, slower at end
    const currentSpeed = 15 * (1 - easedProgress);
    
    // Apply rotation - more chaotic at beginning
    dice.style.transform = `
      rotateX(${progress * 720 + currentSpeed * Math.sin(now * 0.01)}deg)
      rotateY(${progress * 360 + currentSpeed * Math.cos(now * 0.01)}deg)
      rotateZ(${progress * 180 + currentSpeed * Math.sin(now * 0.02)}deg)
    `;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation finished - use the pre-determined result
      
      // Set final rotation based on result to show the correct face
      let finalRotationX = 0;
      let finalRotationY = 0;
      let finalRotationZ = 0;
      
      // These rotations are calibrated specifically to show the correct face
      switch (randomResult) {
        case 1: // Face 1 up (front face)
          finalRotationX = 0;
          finalRotationY = 0;
          finalRotationZ = 0;
          break;
        case 6: // Face 6 up (back face)
          finalRotationX = 0;
          finalRotationY = 180;
          finalRotationZ = 0;
          break;
        case 2: // Face 2 up (top face)
          finalRotationX = -90;
          finalRotationY = 0;
          finalRotationZ = 0;
          break;
        case 5: // Face 5 up (bottom face)
          finalRotationX = 90;
          finalRotationY = 0;
          finalRotationZ = 0;
          break;
        case 3: // Face 3 up (right face)
          finalRotationX = 0;
          finalRotationY = -90;
          finalRotationZ = 0;
          break;
        case 4: // Face 4 up (left face)
          finalRotationX = 0;
          finalRotationY = 90;
          finalRotationZ = 0;
          break;
      }
      
      // Apply final rotation with a transition for a smooth stop
      dice.style.transition = 'transform 0.3s ease-out';
      dice.style.transform = `rotateX(${finalRotationX}deg) rotateY(${finalRotationY}deg) rotateZ(${finalRotationZ}deg)`;
      
      // Complete the roll with the pre-determined result
      completeDiceRoll(randomResult);
    }
  }
  
  // Start animation
  requestAnimationFrame(animate);
}

function completeDiceRoll(result) {
  // Play landing sound
  playSound('impact');
  
  // Strong vibration for the impact
  vibrate(100);
  
  // Update the result display
  const resultElement = document.getElementById('diceResult');
  resultElement.textContent = result;
  resultElement.classList.add('result-change');
  setTimeout(() => resultElement.classList.remove('result-change'), 300);
  
  // Add to simulation history
  addSimulation({
    type: 'dice',
    result: result.toString()
  });
  
  // Reset animation state
  isAnimating = false;
}

// ================================
// Coin Simulation
// ================================

function animateCoin() {
  const coin = document.getElementById('coin');
  if (!coin || isAnimating) return;
  
  isAnimating = true;
  document.getElementById('coinResult').textContent = '?';
  
  // Pre-determine the result for consistency
  const isHeads = Math.random() > 0.5;
  const result = isHeads ? 'Heads' : 'Tails';
  
  // Play coin flip sound
  playSound('flip');
  
  // Apply vibration pattern for flipping
  vibrate(40);
  
  // Animation setup
  const startTime = Date.now();
  const duration = 1500; // 1.5 seconds
  
  // Remove any existing transition
  coin.style.transition = 'none';
  
  // Animation function
  function animate() {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Animation timing function - ease out as time passes
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOut(progress);
    
    // Flips get slower towards the end
    const flips = 10; // Total number of flips
    const currentFlips = flips * easedProgress;
    const rotationY = currentFlips * 180;
    
    // Apply rotation + slight wobble for realism
    const wobbleX = Math.sin(progress * Math.PI * 8) * (1 - easedProgress) * 10;
    coin.style.transform = `
      rotateY(${rotationY}deg)
      rotateX(${wobbleX}deg)
    `;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation finished, set the final position based on result
      // Ensure heads shows face up (0 or 360 deg) and tails shows back up (180 deg)
      const finalRotation = isHeads ? 
        Math.floor(currentFlips) * 180 : // Ensure it's an even multiple of 180 for heads up
        Math.floor(currentFlips) * 180 + 180; // Ensure it's an odd multiple of 180 for tails up
      
      coin.style.transition = 'transform 0.3s ease-out';
      coin.style.transform = `rotateY(${finalRotation}deg)`;
      
      // Complete the flip
      completeCoinFlip(result);
    }
  }
  
  // Start animation
  requestAnimationFrame(animate);
}

function completeCoinFlip(result) {
  // Play landing sound
  playSound('impact');
  
  // Strong vibration for the impact
  vibrate(70);
  
  // Update the result display
  const resultElement = document.getElementById('coinResult');
  resultElement.textContent = result;
  resultElement.classList.add('result-change');
  setTimeout(() => resultElement.classList.remove('result-change'), 300);
  
  // Add to simulation history
  addSimulation({
    type: 'coin',
    result: result
  });
  
  // Reset animation state
  isAnimating = false;
}

// ================================
// Wheel Simulation
// ================================

function setupWheel() {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  
  // Draw wheel sections
  const sectionAngle = (2 * Math.PI) / 8;
  
  for (let i = 0; i < 8; i++) {
    const startAngle = i * sectionAngle;
    const endAngle = (i + 1) * sectionAngle;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    
    ctx.fillStyle = wheelColors[i];
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add numbers
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sectionAngle / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(String(i + 1), radius * 0.75, 0);
    ctx.restore();
  }
  
  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
  ctx.fillStyle = '#333333';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add center icon
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '18px FontAwesome';
  ctx.fillText('\uf2f1', centerX, centerY); // fa-sync-alt icon
}

function animateWheel() {
  const wheel = document.getElementById('wheel');
  if (!wheel || isAnimating) return;
  
  isAnimating = true;
  document.getElementById('wheelResult').textContent = '?';
  
  // Pre-determine the result for consistency
  const sectionIndex = Math.floor(Math.random() * 8);
  const result = wheelResults[sectionIndex];
  
  // Play spin start sound
  playSound('wheel-spin');
  
  // Apply multi-pulse vibration for wheel start
  vibrate([20, 30, 20]);
  
  // Set up click sound interval
  clickInterval = setInterval(() => {
    playSound('wheel-tick');
  }, 100);
  
  // Calculate section angle and rotation
  const sectionAngle = 360 / 8;
  const sectionCenter = sectionIndex * sectionAngle;
  
  // Calculate final rotation
  // We need at least 5 full rotations plus the exact angle to land on the correct section
  const targetAngle = 360 * 5 + sectionCenter + (Math.random() * 5 - 2.5);
  
  // Apply animation
  wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
  wheel.style.transform = `rotate(${targetAngle}deg)`;
  
  // Schedule the end of spinning after animation
  setTimeout(() => {
    // Clear click interval
    if (clickInterval) {
      clearInterval(clickInterval);
      clickInterval = null;
    }
    
    // Play winning sound
    playSound('wheel-stop');
    
    // Strong vibration for the win
    vibrate(80);
    
    // Complete the spin
    completeWheelSpin(result);
  }, 3000);
}

function completeWheelSpin(result) {
  // Update the result display
  const resultElement = document.getElementById('wheelResult');
  resultElement.textContent = result;
  resultElement.classList.add('result-change');
  setTimeout(() => resultElement.classList.remove('result-change'), 300);
  
  // Add to simulation history
  addSimulation({
    type: 'wheel',
    result: result
  });
  
  // Reset animation state
  isAnimating = false;
}

// ================================
// Simulation Management
// ================================

function addSimulation(sim) {
  // Create simulation object with timestamp
  const newSim = {
    ...sim,
    timestamp: Date.now()
  };
  
  // Add to the beginning of the array
  simulations.unshift(newSim);
  
  // Update the UI
  updateHistoryUI();
  updateStatisticsUI();
  
  // Save to localStorage
  saveSimulations();
}

function addMultipleSimulations(count) {
  if (count <= 0 || isAnimating) return;
  
  vibrate([30, 50, 30]);
  
  // Generate multiple random results
  const baseTime = Date.now();
  const newSimulations = [];
  
  for (let i = 0; i < count; i++) {
    let result;
    
    if (activeTab === 'dice') {
      result = rollDice().toString();
    } else if (activeTab === 'coin') {
      result = flipCoin();
    } else { // wheel
      result = wheelResults[spinWheel() - 1];
    }
    
    newSimulations.push({
      type: activeTab,
      result,
      timestamp: baseTime - i * 100 // Stagger timestamps slightly
    });
  }
  
  // Add all results to the simulation array
  simulations = [...newSimulations, ...simulations];
  
  // Update the UI
  updateHistoryUI();
  updateStatisticsUI();
  
  // Save to localStorage
  saveSimulations();
}

function clearSimulations() {
  if (simulations.length === 0) return;
  
  if (confirm("Are you sure you want to clear all history?")) {
    simulations = [];
    updateHistoryUI();
    updateStatisticsUI();
    saveSimulations();
    vibrate(30);
  }
}

function exportSimulationData() {
  if (simulations.length === 0) {
    alert("No data to export.");
    return;
  }
  
  // Format data for export
  const csvContent = [
    "Type,Result,Timestamp",
    ...simulations.map(sim => 
      `${sim.type},${sim.result},${new Date(sim.timestamp).toISOString()}`
    )
  ].join("\n");
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'probability_simulation_results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  vibrate(50);
}

// ================================
// Storage
// ================================

function saveSimulations() {
  try {
    localStorage.setItem('simulations', JSON.stringify(simulations));
  } catch (error) {
    console.error('Error saving simulations to localStorage:', error);
  }
}

function loadSimulations() {
  try {
    const savedSims = localStorage.getItem('simulations');
    if (savedSims) {
      simulations = JSON.parse(savedSims);
      updateHistoryUI();
      updateStatisticsUI();
    }
    
    // Load sound preference
    const soundPref = localStorage.getItem('soundEnabled');
    if (soundPref !== null) {
      soundEnabled = soundPref === 'true';
      document.getElementById('soundToggle').innerHTML = soundEnabled 
        ? '<i class="fas fa-volume-up text-[#7C4DFF]"></i>' 
        : '<i class="fas fa-volume-mute text-gray-400"></i>';
    }
  } catch (error) {
    console.error('Error loading simulations from localStorage:', error);
  }
}

// ================================
// UI Updates
// ================================

function updateHistoryUI() {
  const historyList = document.getElementById('historyList');
  const totalSimulations = document.getElementById('totalSimulations');
  const simulationTime = document.getElementById('simulationTime');
  const exportBtn = document.getElementById('exportDataBtn');
  
  // Update total count
  totalSimulations.textContent = simulations.length;
  
  // Update export button state
  if (simulations.length > 0) {
    exportBtn.disabled = false;
    exportBtn.classList.remove('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
    exportBtn.classList.add('bg-[#2A2A2A]', 'hover:bg-[#1E1E1E]');
  } else {
    exportBtn.disabled = true;
    exportBtn.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
    exportBtn.classList.remove('bg-[#2A2A2A]', 'hover:bg-[#1E1E1E]');
  }
  
  // Update simulation time
  if (simulations.length > 0) {
    const firstTime = simulations[simulations.length - 1].timestamp;
    const now = Date.now();
    const diffInSeconds = Math.floor((now - firstTime) / 1000);
    
    if (diffInSeconds < 60) {
      simulationTime.textContent = `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      simulationTime.textContent = `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      simulationTime.textContent = `${hours}h ${minutes}m`;
    }
  } else {
    simulationTime.textContent = '0s';
  }
  
  // Clear the history list
  historyList.innerHTML = '';
  
  // If no simulations, show empty state
  if (simulations.length === 0) {
    historyList.innerHTML = `
      <div class="bg-[#1E1E1E] p-6 rounded-lg text-center text-gray-400">
        <i class="fas fa-info-circle mr-2"></i>
        No history yet. Run some simulations!
      </div>
    `;
    return;
  }
  
  // Create history items (limit to 100 most recent)
  const limit = Math.min(simulations.length, 100);
  for (let i = 0; i < limit; i++) {
    const sim = simulations[i];
    const historyItem = document.createElement('div');
    historyItem.className = 'bg-[#1E1E1E] p-3 rounded-lg flex items-center';
    if (i === 0) historyItem.classList.add('history-item-new');
    
    historyItem.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-[#7C4DFF] flex items-center justify-center mr-3">
        <i class="fas ${getIconClass(sim.type)} text-white"></i>
      </div>
      <div class="flex-1">
        <div class="flex justify-between">
          <div class="font-mono font-bold text-lg">${sim.result}</div>
          <div class="text-xs text-gray-400">${formatTimeAgo(sim.timestamp)}</div>
        </div>
        <div class="text-sm text-gray-400">${getTypeLabel(sim.type)}</div>
      </div>
    `;
    
    historyList.appendChild(historyItem);
  }
  
  // Update times periodically
  setTimeout(() => {
    if (simulations.length > 0) {
      const timeElements = historyList.querySelectorAll('.text-xs.text-gray-400');
      simulations.slice(0, timeElements.length).forEach((sim, index) => {
        timeElements[index].textContent = formatTimeAgo(sim.timestamp);
      });
    }
  }, 30000); // Update every 30 seconds
}

function calculateStatistics(type) {
  const filteredSims = simulations.filter(sim => sim.type === type);
  
  // Initialize statistics object
  const stats = {
    totalTrials: filteredSims.length,
    outcomes: {},
    expectedValue: 0,
    variance: 0,
    stdDeviation: 0
  };
  
  if (filteredSims.length === 0) {
    return stats;
  }
  
  // Count outcomes
  filteredSims.forEach(sim => {
    if (!stats.outcomes[sim.result]) {
      stats.outcomes[sim.result] = 0;
    }
    stats.outcomes[sim.result]++;
  });
  
  // Calculate expected value
  if (type === 'dice') {
    // For dice, use the numeric value
    let sum = 0;
    let values = [];
    
    Object.entries(stats.outcomes).forEach(([result, count]) => {
      const value = parseInt(result, 10);
      sum += value * count;
      // Repeat the value 'count' times for variance calculation
      for (let i = 0; i < count; i++) {
        values.push(value);
      }
    });
    
    stats.expectedValue = sum / stats.totalTrials;
    
    // Calculate variance and standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - stats.expectedValue, 2));
    stats.variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    stats.stdDeviation = Math.sqrt(stats.variance);
  } 
  else if (type === 'coin') {
    // For coin, assign 1 to Heads and 0 to Tails
    const headsCount = stats.outcomes['Heads'] || 0;
    const tailsCount = stats.outcomes['Tails'] || 0;
    
    stats.expectedValue = headsCount / stats.totalTrials;
    
    // For a binary outcome, variance = p * (1-p)
    const p = stats.expectedValue; // probability of heads
    stats.variance = p * (1 - p);
    stats.stdDeviation = Math.sqrt(stats.variance);
  }
  else if (type === 'wheel') {
    // For wheel, use the numeric part of the result
    let sum = 0;
    let values = [];
    
    Object.entries(stats.outcomes).forEach(([result, count]) => {
      // Extract number from results like "Red (1)"
      const match = result.match(/\((\d+)\)/);
      const value = match ? parseInt(match[1], 10) : 0;
      
      sum += value * count;
      // Repeat the value 'count' times for variance calculation
      for (let i = 0; i < count; i++) {
        values.push(value);
      }
    });
    
    stats.expectedValue = sum / stats.totalTrials;
    
    // Calculate variance and standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - stats.expectedValue, 2));
    stats.variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    stats.stdDeviation = Math.sqrt(stats.variance);
  }
  
  return stats;
}

function getColorForResult(result, type) {
  if (type === 'coin') {
    return result === 'Heads' ? '#FFD700' : '#FFA500';
  } else if (type === 'dice') {
    // Different color for each dice face
    const colors = ['#C62828', '#AD1457', '#6A1B9A', '#4527A0', '#283593', '#1565C0'];
    const num = parseInt(result, 10);
    return colors[num - 1] || '#7C4DFF';
  } else if (type === 'wheel') {
    // Extract color based on result name
    if (result.includes('Red')) return '#F44336';
    if (result.includes('Orange')) return '#FF9800';
    if (result.includes('Yellow')) return '#FFEB3B';
    if (result.includes('Green')) return '#4CAF50';
    if (result.includes('Blue')) return '#2196F3';
    if (result.includes('Purple')) return '#9C27B0';
    if (result.includes('Pink')) return '#E91E63';
    if (result.includes('Teal')) return '#009688';
    return '#7C4DFF';
  }
  return '#7C4DFF';
}

function getPercentage(value, total) {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function updateStatisticsUI() {
  const statsContent = document.getElementById('statsContent');
  const stats = calculateStatistics(activeStatsTab);
  
  if (!stats || stats.totalTrials === 0) {
    statsContent.innerHTML = `
      <div class="bg-[#1E1E1E] p-4 rounded-lg text-center text-gray-400 h-64 flex items-center justify-center">
        <div>
          <i class="fas fa-chart-bar text-4xl mb-3"></i>
          <p>No statistics available yet.<br/>Run some ${activeStatsTab} simulations!</p>
        </div>
      </div>
    `;
    return;
  }
  
  let statsHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-[#1E1E1E] p-3 rounded-lg">
          <div class="text-sm text-gray-400 mb-1">Total Trials</div>
          <div class="text-2xl font-bold font-mono">${stats.totalTrials}</div>
        </div>
        <div class="bg-[#1E1E1E] p-3 rounded-lg">
          <div class="text-sm text-gray-400 mb-1">Expected Value</div>
          <div class="text-2xl font-bold font-mono">${stats.expectedValue.toFixed(2)}</div>
        </div>
        <div class="bg-[#1E1E1E] p-3 rounded-lg">
          <div class="text-sm text-gray-400 mb-1">Variance</div>
          <div class="text-2xl font-bold font-mono">${stats.variance.toFixed(2)}</div>
        </div>
        <div class="bg-[#1E1E1E] p-3 rounded-lg">
          <div class="text-sm text-gray-400 mb-1">Standard Deviation</div>
          <div class="text-2xl font-bold font-mono">${stats.stdDeviation.toFixed(2)}</div>
        </div>
      </div>
      
      <div class="bg-[#1E1E1E] p-3 rounded-lg">
        <div class="text-sm text-gray-400 mb-3">Outcome Distribution</div>
        
        <div class="h-40 w-full">
  `;
  
  // Visualization based on type
  if (activeStatsTab === 'coin') {
    statsHTML += `
      <div class="flex h-full">
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
          <div class="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center mb-1">
            <div class="text-yellow-100 text-xl font-bold">H</div>
          </div>
          <div class="text-sm font-mono font-bold">${getPercentage(stats.outcomes['Heads'] || 0, stats.totalTrials)}</div>
        </div>
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
          <div class="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center mb-1">
            <div class="text-yellow-100 text-xl font-bold">T</div>
          </div>
          <div class="text-sm font-mono font-bold">${getPercentage(stats.outcomes['Tails'] || 0, stats.totalTrials)}</div>
        </div>
      </div>
    `;
  } else if (activeStatsTab === 'dice') {
    statsHTML += `
      <div class="flex flex-wrap justify-center items-center h-full">
    `;
    
    for (let num = 1; num <= 6; num++) {
      statsHTML += `
        <div class="w-16 h-16 m-1 bg-white rounded-lg flex items-center justify-center relative">
          <div class="absolute top-0 right-0 w-6 h-6 rounded-full bg-[#7C4DFF] flex items-center justify-center text-white text-xs">
            ${getPercentage(stats.outcomes[num.toString()] || 0, stats.totalTrials)}
          </div>
      `;
      
      // Add dots based on dice face
      if (num === 1) {
        statsHTML += `<div class="w-4 h-4 bg-black rounded-full"></div>`;
      } else if (num === 2) {
        statsHTML += `
          <div class="flex justify-between w-full px-2">
            <div class="w-3 h-3 bg-black rounded-full self-start"></div>
            <div class="w-3 h-3 bg-black rounded-full self-end"></div>
          </div>
        `;
      } else if (num === 3) {
        statsHTML += `
          <div class="flex flex-col w-full items-center justify-between py-2">
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
          </div>
        `;
      } else if (num === 4) {
        statsHTML += `
          <div class="grid grid-cols-2 gap-2 p-2 w-full h-full">
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
          </div>
        `;
      } else if (num === 5) {
        statsHTML += `
          <div class="grid grid-cols-2 gap-2 p-2 w-full h-full">
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full justify-self-center col-span-2"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
          </div>
        `;
      } else if (num === 6) {
        statsHTML += `
          <div class="grid grid-cols-2 gap-2 p-2 w-full h-full">
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
            <div class="w-3 h-3 bg-black rounded-full"></div>
          </div>
        `;
      }
      
      statsHTML += `</div>`;
    }
    
    statsHTML += `</div>`;
  } else if (activeStatsTab === 'wheel') {
    statsHTML += `
      <div class="h-full flex justify-center">
        <svg viewBox="0 0 100 100" class="w-64 h-full">
          <g transform="translate(50, 50)">
    `;
    
    const outcomes = Object.entries(stats.outcomes);
    const total = outcomes.reduce((sum, [_, count]) => sum + Number(count), 0);
    
    if (outcomes.length > 0) {
      // Sort by the number in parentheses
      outcomes.sort((a, b) => {
        const numA = parseInt(a[0].match(/\((\d+)\)/)?.[1] || '0');
        const numB = parseInt(b[0].match(/\((\d+)\)/)?.[1] || '0');
        return numA - numB;
      });
      
      // Calculate angles for each section
      let startAngle = -Math.PI / 2; // Start at top
      
      outcomes.forEach(([result, count]) => {
        const percentage = Number(count) / total;
        const angle = percentage * Math.PI * 2;
        const endAngle = startAngle + angle;
        
        // Calculate arc coordinates
        const innerRadius = 20;
        const outerRadius = 45;
        
        const startX1 = Math.cos(startAngle) * innerRadius;
        const startY1 = Math.sin(startAngle) * innerRadius;
        const startX2 = Math.cos(startAngle) * outerRadius;
        const startY2 = Math.sin(startAngle) * outerRadius;
        
        const endX1 = Math.cos(endAngle) * outerRadius;
        const endY1 = Math.sin(endAngle) * outerRadius;
        const endX2 = Math.cos(endAngle) * innerRadius;
        const endY2 = Math.sin(endAngle) * innerRadius;
        
        // Create arc path
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        const pathData = `
          M ${startX1} ${startY1}
          L ${startX2} ${startY2}
          A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX1} ${endY1}
          L ${endX2} ${endY2}
          A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX1} ${startY1}
        `;
        
        // Get color for this section
        const color = getColorForResult(result, 'wheel');
        
        // Draw section
        statsHTML += `<path d="${pathData}" fill="${color}" stroke="#333" stroke-width="0.5" />`;
        
        // Add label
        const midAngle = (startAngle + endAngle) / 2;
        const labelX = Math.cos(midAngle) * (innerRadius + outerRadius) * 0.5;
        const labelY = Math.sin(midAngle) * (innerRadius + outerRadius) * 0.5;
        
        // Extract number from result
        const labelMatch = result.match(/\((\d+)\)/);
        const label = labelMatch ? labelMatch[1] : '';
        
        statsHTML += `
          <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="4" font-weight="bold">${label}</text>
          <text x="${labelX * 1.35}" y="${labelY * 1.35}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="3">${getPercentage(count, total)}</text>
        `;
        
        // Move to next section
        startAngle = endAngle;
      });
    }
    
    statsHTML += `
          <circle cx="0" cy="0" r="15" fill="#333" stroke="#555" stroke-width="1" />
          </g>
        </svg>
      </div>
    `;
  }
  
  statsHTML += `
        </div>
      </div>
      
      <div class="bg-[#1E1E1E] p-3 rounded-lg">
        <div class="text-sm text-gray-400 mb-2">Results Breakdown</div>
        <div class="space-y-2">
  `;
  
  Object.entries(stats.outcomes).forEach(([key, value]) => {
    statsHTML += `
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-sm mr-2" style="background-color: ${getColorForResult(key, activeStatsTab)}"></div>
          <span>${key}</span>
        </div>
        <div class="flex items-center">
          <span class="mr-2 font-mono">${value}</span>
          <span class="text-xs text-gray-400">(${getPercentage(value, stats.totalTrials)})</span>
        </div>
      </div>
    `;
  });
  
  statsHTML += `
        </div>
      </div>
    </div>
  `;
  
  statsContent.innerHTML = statsHTML;
}

function switchTab(tabName) {
  if (tabName === activeTab || isAnimating) return;
  
  // Apply vibration
  vibrate(20);
  
  // Update active tab state
  activeTab = tabName;
  
  // Update UI for tabs
  document.getElementById('diceTab').className = `flex-1 py-2 rounded-md text-sm font-medium ${
    activeTab === 'dice' 
      ? 'bg-[#7C4DFF] text-white' 
      : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
  }`;
  
  document.getElementById('coinTab').className = `flex-1 py-2 rounded-md text-sm font-medium ${
    activeTab === 'coin'
      ? 'bg-[#7C4DFF] text-white' 
      : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
  }`;
  
  document.getElementById('wheelTab').className = `flex-1 py-2 rounded-md text-sm font-medium ${
    activeTab === 'wheel'
      ? 'bg-[#7C4DFF] text-white' 
      : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
  }`;
  
  // Show the corresponding simulation component
  document.getElementById('diceSimulation').style.display = activeTab === 'dice' ? 'block' : 'none';
  document.getElementById('coinSimulation').style.display = activeTab === 'coin' ? 'block' : 'none';
  document.getElementById('wheelSimulation').style.display = activeTab === 'wheel' ? 'block' : 'none';
}

function switchStatsTab(tabName) {
  if (tabName === activeStatsTab) return;
  
  // Apply vibration
  vibrate(20);
  
  // Update active tab state
  activeStatsTab = tabName;
  
  // Update UI for tabs
  document.getElementById('diceStatsTab').className = `py-2 px-4 font-medium ${
    activeStatsTab === 'dice' 
      ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' 
      : 'text-gray-400'
  }`;
  
  document.getElementById('coinStatsTab').className = `py-2 px-4 font-medium ${
    activeStatsTab === 'coin'
      ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' 
      : 'text-gray-400'
  }`;
  
  document.getElementById('wheelStatsTab').className = `py-2 px-4 font-medium ${
    activeStatsTab === 'wheel'
      ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' 
      : 'text-gray-400'
  }`;
  
  // Update statistics display
  updateStatisticsUI();
}

// ================================
// Event Listeners
// ================================

document.addEventListener('DOMContentLoaded', function() {
  // Setup simulations
  setupDice();
  setupWheel();
  
  // Load saved data
  loadSimulations();
  
  // Sound toggle
  document.getElementById('soundToggle').addEventListener('click', toggleSound);
  
  // Tab switching
  document.getElementById('diceTab').addEventListener('click', () => switchTab('dice'));
  document.getElementById('coinTab').addEventListener('click', () => switchTab('coin'));
  document.getElementById('wheelTab').addEventListener('click', () => switchTab('wheel'));
  
  // Stats tab switching
  document.getElementById('diceStatsTab').addEventListener('click', () => switchStatsTab('dice'));
  document.getElementById('coinStatsTab').addEventListener('click', () => switchStatsTab('coin'));
  document.getElementById('wheelStatsTab').addEventListener('click', () => switchStatsTab('wheel'));
  
  // Simulation actions
  document.getElementById('rollDiceBtn').addEventListener('click', animateDice);
  document.getElementById('flipCoinBtn').addEventListener('click', animateCoin);
  document.getElementById('spinWheelBtn').addEventListener('click', animateWheel);
  
  // Batch simulations
  document.getElementById('simulate10').addEventListener('click', () => addMultipleSimulations(10));
  document.getElementById('simulate50').addEventListener('click', () => addMultipleSimulations(50));
  document.getElementById('simulate100').addEventListener('click', () => addMultipleSimulations(100));
  
  // History actions
  document.getElementById('clearHistoryBtn').addEventListener('click', clearSimulations);
  document.getElementById('exportDataBtn').addEventListener('click', exportSimulationData);
  
  // Update simulation time periodically
  setInterval(() => {
    updateHistoryUI();
  }, 60000); // Update every minute
});

// ================================
// Initialization Complete
// ================================
console.log('MG1999 Probability Simulator initialized!');