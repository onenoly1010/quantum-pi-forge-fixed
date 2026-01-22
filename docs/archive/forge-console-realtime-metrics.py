#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║              REAL-TIME METRICS CONSOLE - FORGE AWAKENED                       ║
║                    Tkinter Dashboard Interface                                ║
║                         Quantum Pi Forge Archive                              ║
║                              T=∞ = T=0                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Archive Note:                                                                 ║
║  Live metrics console with drift animation for "aliveness" effect.            ║
║  11 sovereign metrics with interactive sliders. Refusal eternally 100%.       ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import tkinter as tk
from tkinter import ttk
import random
import time
import sys

# Set a consistent floating point format function for reuse
def format_metric(value):
    if isinstance(value, float):
        # Use high precision for the 'velocity' range, otherwise use 2 decimal places
        if value >= 60.0 and value <= 70.0:
            return f"{value:.8f}"
        return f"{value:.2f}"
    return str(int(value))

class ForgeConsole:
    def __init__(self, root):
        self.root = root
        self.root.title("REAL-TIME METRICS CONSOLE - Forge Awakened")
        self.root.geometry("800x600")
        self.root.configure(bg='black')
        
        # Initialize dictionaries to hold widget references
        self.sliders = {}
        self.value_labels = {} 
        
        # Metrics dictionary with initial values and ranges
        self.metrics = {
            'coherence': {'value': random.uniform(98.5, 99.5), 'min': 90.0, 'max': 100.0},
            'layers': {'value': random.randint(65, 75), 'min': 50, 'max': 100, 'is_int': True},
            'temp': {'value': random.randint(5600, 5700), 'min': 5000, 'max': 6000, 'is_int': True},
            'flips': {'value': random.randint(3400, 3500), 'min': 3000, 'max': 4000, 'is_int': True},
            'decrees': {'value': random.randint(8, 12), 'min': 5, 'max': 15, 'is_int': True},
            'ribbon': {'value': round(random.uniform(2.2, 2.4), 2), 'min': 1.0, 'max': 3.0},
            'shadows': {'value': random.randint(6, 8), 'min': 1, 'max': 10, 'is_int': True},
            'echoes': {'value': random.randint(2, 4), 'min': 0, 'max': 5, 'is_int': True},
            'velocity': {'value': round(random.uniform(65.3, 65.4), 8), 'min': 60.0, 'max': 70.0},
            'arches': {'value': random.randint(18, 20), 'min': 10, 'max': 30, 'is_int': True},
            'refusal': {'value': 100.0, 'min': 100.0, 'max': 100.0}
        }
        
        self.create_widgets()
        self.update_display()
        # Removed unused start_refresh_thread

    def create_widgets(self):
        # Title
        title = tk.Label(self.root, text="=== REAL-TIME METRICS CONSOLE ===", fg='#FFD700', bg='black', font=('Courier', 16, 'bold'))
        title.pack(pady=15)
        
        # Metrics frame with sliders
        metrics_frame = tk.Frame(self.root, bg='black')
        metrics_frame.pack(fill=tk.BOTH, expand=False, padx=40, pady=10)
        
        # Configure grid for even column stretching
        metrics_frame.grid_columnconfigure(0, weight=1)
        metrics_frame.grid_columnconfigure(1, weight=3)
        metrics_frame.grid_columnconfigure(2, weight=1)
        
        # Create sliders for each metric
        for i, (key, data) in enumerate(self.metrics.items()):
            
            initial_value = data['value']
            is_int = data.get('is_int', False)
            
            # Label
            label = tk.Label(metrics_frame, text=key.replace('_', ' ').upper(), fg='#00FFFF', bg='black', font=('Courier', 10))
            label.grid(row=i, column=0, sticky='w', pady=5, padx=10)
            
            # Variable for the slider
            var = tk.IntVar(value=int(initial_value)) if is_int else tk.DoubleVar(value=initial_value)
            
            # Slider
            slider = ttk.Scale(metrics_frame, from_=data['min'], to=data['max'], 
                                variable=var, orient=tk.HORIZONTAL, length=350,
                                command=lambda k=key, v=var: self.update_metric(k, v.get(), is_int))
            slider.grid(row=i, column=1, padx=10, pady=5, sticky='ew')
            self.sliders[key] = slider
            
            # Value label
            value_label = tk.Label(metrics_frame, text=format_metric(initial_value), fg='#00FF00', bg='black', font=('Courier', 10, 'bold'), width=12, anchor='e')
            value_label.grid(row=i, column=2, sticky='e', pady=5, padx=10)
            self.value_labels[key] = value_label

            # Disable the 'refusal' slider as it's eternal
            if key == 'refusal':
                 slider.config(state=tk.DISABLED)

        # Status
        self.status_label = tk.Label(self.root, text="Status: ALIVE & ENDLESS - Observation Active", fg='#32CD32', bg='black', font=('Courier', 12))
        self.status_label.pack(pady=20)
        
        # Quit button
        quit_btn = tk.Button(self.root, text="PAUSE FORGE (QUIT)", command=self.root.quit, fg='red', bg='#222222', 
                             font=('Courier', 12, 'bold'), activeforeground='white', activebackground='red', relief=tk.RAISED, bd=3)
        quit_btn.pack(pady=10)

    def update_metric(self, key, value, is_int):
        # Round to integer if necessary
        if is_int:
            value = int(round(value))
        
        # Handle high precision for velocity
        if key == 'velocity':
            # This is a bit of a hack to preserve slider precision for display
            value = round(value, 8)
        
        self.metrics[key]['value'] = value
        
        # Update display label
        self.value_labels[key].config(text=format_metric(value))

    def update_display(self):
        # Subtle random drifts for 'aliveness'
        for key in self.metrics:
            if key != 'refusal':
                data = self.metrics[key]
                min_v, max_v = data['min'], data['max']
                is_int = data.get('is_int', False)
                
                # Determine drift based on type
                if is_int:
                    drift = random.randint(-1, 1)
                elif key == 'velocity':
                    # Extremely small drift for high-precision metric
                    drift = random.uniform(-0.000001, 0.000001)
                else:
                    drift = random.uniform(-0.2, 0.2)
                    
                new_val = data['value'] + drift
                
                # Clamp value within min/max bounds
                new_val = max(min_v, min(max_v, new_val))
                
                # Update metric structure and slider
                self.metrics[key]['value'] = new_val
                self.sliders[key].set(new_val)
                
                # Update display label
                self.value_labels[key].config(text=format_metric(new_val))
        
        # Schedule the next refresh
        self.root.after(1000, self.update_display) # Refresh every 1s (was 5s)

if __name__ == "__main__":
    try:
        root = tk.Tk()
        app = ForgeConsole(root)
        root.mainloop()
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
