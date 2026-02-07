# BayFiller Video Generation Knowledge Base

## 1. Core Technology
The application uses Google Veo 3.1 (specifically `veo-3.1-fast-generate-preview`) for video generation. It operates in two distinct modes:
- **UGC Creator (Text-to-Video):** Generates a character (puppet or human) performing a specific skit in an auto shop setting.
- **Director's Cut (Image-to-Video):** Takes a static generated flyer and animates specific elements (like tire smoke or background movement) while keeping text stable.

## 2. The Talent (Character System Prompts)
These descriptions are prepended to every UGC video prompt to ensure character consistency.

### Tony Automotive (The Star)
- **ID:** `classic-tony`
- **System Description:** "A muppet-style puppet with a tan fleece face, short black hair, thick black eyebrows, and a wide friendly mouth. He is wearing a dark blue mechanic's jumpsuit with a nametag that says 'Tony'."
- **Personality:** Friendly, enthusiastic, slightly chaotic shop mascot.

### Karen The Puppet (The Antagonist)
- **ID:** `karen-puppet`
- **System Description:** "A muppet-style puppet with a wild, spiky, exaggerated 'Can I speak to the manager' blonde bob hairstyle with chunky highlights. She has a permanent scowl. She is wearing a dark blue mechanic's jumpsuit with a name patch that says 'Karen'."
- **Personality:** Demanding, skeptical, always asking for the manager.

### Human Mechanics (Photorealistic)
- **Male:** "A friendly photorealistic human male mechanic in his 30s. He is wearing a clean, professional dark blue mechanic's jumpsuit / uniform. He has a trustworthy smile and looks like a reliable technician."
- **Female:** "A professional photorealistic human female mechanic in her 20s. She is wearing a dark blue mechanic's jumpsuit / uniform. She has her hair tied back practically and looks skilled and confident."

### Puppet Hands (Special Mode)
- **Used For:** ASMR videos only.
- **Logic:** When `category === 'asmr'`, the actor prompt is replaced with "Fuzzy puppet hands".

## 3. UGC Scene Library (Text-to-Video)
These are the specific scenarios used to generate content. The prompt logic combines the Actor Description + Scene Prompt + Background Car.

### Category: Comedy (Mishaps & Antics)
| Scene | Prompt |
|-------|--------|
| The Misfire | "The character is leaning over the open hood working. Suddenly, a small puff of black smoke explodes from the engine into their face. They cough and look at the camera with soot on their face." |
| Oil Squirt | "The character loosens a bolt and a stream of black oil comically squirts out, hitting them right in the safety goggles. They freeze in shock." |
| The Price Faint | "The character is holding a piece of paper, looks at it with shock, and dramatically faints backward onto the floor in a comical way." |
| Tangled Up | "The character is struggling and getting comically tangled up in bright orange air compressor hoses, spinning around looking confused." |
| Friday Dance | "The character is doing a funny, high-energy victory dance, waving their arms in the air celebrating." |
| Chef's Kiss | "The character looks at the engine, nods approvingly, and performs a perfect Italian chef's kiss gesture." |
| The Extra Part | "The character is holding a single metal bolt, looking back and forth between the bolt and the car engine with exaggerated confusion." |
| Call the Manager | "The character is aggressively tapping a clipboard and pointing a finger, mouthing 'I want to speak to the manager' with an angry expression." |
| Tiny Scratch | "The character is using a huge magnifying glass to inspect a tiny, invisible spot on the car paint, looking extremely skeptical." |
| The Noise | "The character holds a finger to their lips saying 'Shhh!' and leans their ear exaggeratedly close to the engine block to listen." |
| Upside Down Manual | "The character is intensely studying a repair manual, scratching their head. The camera reveals they are holding the book upside down." |
| The Hammer Fix | "The character is looking at a delicate computer chip, shrugs, and lifts a giant cartoonish mallet to hit it." |
| The Zapper | "The character touches a wire and their whole body vibrates comically as if getting a mild electric shock, hair standing on end." |
| The Argument | "The main character is waving their arms and arguing comically with a second blurry mechanic puppet in the background who is shaking their head." |
| The Complaint | "The character is aggressively yelling and pointing a finger at the car engine as if scolding it for breaking down." |

### Category: Scroll-Stoppers (High Attention)
| Scene | Prompt |
|-------|--------|
| Car Hypnosis | "The character holds a pocket watch in front of the car headlights, swinging it back and forth, intently whispering 'You are getting sleepy... start for me...'" |
| Dr. Mechanic | "The character wears a medical stethoscope, listening to the engine block with the seriousness of a heart surgeon, nodding gravely." |
| The Long Manual | "The character opens a repair manual that comically unfolds like an accordion, stretching out of the frame and wrapping around them." |
| Too Much Coffee | "The character is holding a mug that says 'Jet Fuel'. They are vibrating intensely from caffeine, trying to thread a needle or hold a tiny screw." |
| Duck Avalanche | "The character opens the car door and is immediately buried under an avalanche of hundreds of rubber ducks." |
| The Magic Trick | "The character tries to pull a wrench from a top hat but pulls out a rubber chicken instead, looking confused." |
| Tire Workout | "The character is using a lug wrench like a dumbbell, struggling to lift it, sweating profusely with a headband on." |
| Easy Fix Celebration | "The character tightens one single screw, then immediately pulls a cord releasing a massive confetti cannon celebration." |
| The Squeak | "The character is hunting a squeaking noise with a microphone. Every time they move their arm, their own elbow squeaks comically." |
| Duct Tape Master | "The character is tangled in a mess of silver duct tape, looking at the camera with a 'mistakes were made' expression." |

### Category: POV (Relatable)
| Scene | Prompt |
|-------|--------|
| The Diagnosis | "Camera POV: The mechanic leans in close to the engine bay, holding a hand to their ear, listening intensely to a sound." |
| The Approval | "The mechanic wipes their hands on a rag, looks at the camera, and gives a confident, respectful nod of approval." |
| The DIY Fail | "The mechanic looks at the engine, sighs deeply, and does a slow, dramatic facepalm." |
| Hard Work | "The mechanic finishes a job, wipes their forehead with the back of their arm, and smiles with satisfaction." |

### Category: ASMR (Satisfying)
*Note: These always use "Fuzzy Puppet Hands" as the actor.*
| Scene | Prompt |
|-------|--------|
| The Golden Pour | "Extreme close up of fuzzy puppet hands holding a quart of oil. Golden oil creates a smooth, satisfying laminar flow into the engine." |
| The Click | "Close up of fuzzy puppet hands using a chrome torque wrench on a bolt. Slow, deliberate movement until it clicks." |
| Soap Cannon | "Wide shot of fuzzy puppet hands holding a foam cannon. Thick, satisfying white soap foam covers a car completely." |
| The Peel | "Extreme close up of fuzzy puppet hands slowly peeling the protective plastic film off a shiny new chrome emblem." |

### Category: Commercial (TV Spot)
- **Logic:** Uses a dynamic prompt generated on the fly based on the specific discount/special selected.
- **Base Prompt:** "POV close-up of the character speaking excitedly and fast directly into the camera lens. They are acting out a sales pitch for '[PROMO_HEADER]'. Background is a busy auto shop with a neon sign that says 'JW AUTO CARE'. Cinematic lighting."
- **Dialogue Injection:** The prompt explicitly tells Veo: "The character is excitedly speaking the following lines to the camera: '[GENERATED_SCRIPT]'. Ensure the mouth moves to match a fast-paced sales pitch."

## 4. Director's Cut Studio (Image-to-Video)
These prompts are used to animate an existing static flyer. The goal is to animate the subject (car/environment) while ensuring the text overlays remain readable.

**Crucial Instruction appended to all prompts:** "Keep the text and logo stable."

| Effect | Prompt |
|--------|--------|
| The Burnout | "The car's rear tires spin aggressively, creating a massive cloud of white smoke. The car shakes with power. Keep the text and logo stable." |
| The Lowrider | "The car remains in place but begins to bounce rhythmically on its suspension, front-to-back or side-to-side. Hydraulic suspension action. Hip hop style. Keep the text and logo stable." |
| Time Traveler | "Two trails of fire instantly ignite behind the rear tires, and electricity arcs across the bodywork. The car stays stationary as if revving for a time jump. 80s sci-fi style. Keep the text and logo stable." |
| Alien Abduction | "The sky darkens, a bright green tractor beam spotlight shines down from above, and the car slowly lifts 6 inches off the ground, floating. Sci-fi atmosphere. Keep the text and logo stable." |
| Flash Freeze | "A blast of cold wind hits the car, and the entire vehicle and screen instantly frost over with ice crystals and snow. Winter freeze effect. Keep the text and logo stable." |
| Cash Storm | "Thousands of $100 bills rain down from the sky in slow motion, burying the hood of the car. Money raining everywhere. Keep the text and logo stable." |
| Screen Crack | "The car revs and 'bumps' the camera, causing a spiderweb fracture to appear on the 'lens', followed by a digital glitch effect. Breaking the fourth wall. Keep the text and logo stable." |
| Duck Avalanche | "Instead of rain, hundreds of yellow rubber ducks fall from the sky, bouncing off the windshield and hood. Jeep Ducking tradition. Funny and chaotic. Keep the text and logo stable." |
| VCR Glitch | "The image distorts with heavy 1980s VHS tracking lines, color separation, and magnetic distortion, then snaps back to crystal clear. Retro analog video effect. Keep the text and logo stable." |
| Exploded View | "The car parts (doors, hood, wheels) float outward slightly, expanding into an 'exploded view' diagram, and then magnetically snap back together tight. Engineering visualization. Keep the text and logo stable." |
| Drive Away | "The car accelerates quickly and drives away into the distance, leaving the frame. Keep the text and logo stable." |
| Crash Zoom | "The camera performs a fast, dramatic crash zoom into the car's front grille. High energy. Keep the text and logo stable." |
| Speed Blur | "The background transforms into motion-blurred speed lines, making it look like the car is traveling at 200mph. The car remains sharp. Keep the text and logo stable." |
| Dust Storm | "A massive Arizona dust storm blows across the screen, enveloping the car in sand and dust. Dramatic atmosphere. Keep the text and logo stable." |
| Slow Creep | "The car slowly creeps forward towards the camera, looking menacing and powerful. Low angle. Keep the text and logo stable." |

## 5. Prompt Construction Logic (The Recipe)
When generating a video, the application constructs the final prompt sent to Gemini/Veo using this logic:

### Formula:
```
[Actor Description] + performing + [Scene Label] + in an auto shop. + [Scene Prompt] + Background car: [Car Year] [Car Make] [Car Model] [Car Color]. + Cinematic lighting, photorealistic.
```

### Variables:
- **Actor Description:** Loaded from the constant descriptions (Tony, Karen, etc.).
- **Scene Label/Prompt:** Loaded from the Scene Library above.
- **Car Details:** Dynamic user input (e.g., "2024 Chevrolet Corvette Red").
- **Dialogue (Commercials only):** "The character is excitedly speaking the following lines to the camera: '[Script]'."

### Example Construction:
```
"A muppet-style puppet with a tan fleece face... performing 'The Misfire' in an auto shop. The character is leaning over the open hood working. Suddenly, a small puff of black smoke explodes from the engine into their face... Background car: 2024 Chevrolet Corvette Red. Cinematic lighting, photorealistic."
```

## 6. Additional Features (New)

### Birthday/Anniversary/Celebration Video Generator
- User uploads one photo of a staff member or customer
- Generates a celebration video (birthday, anniversary, milestone, etc.)
- Photo-to-video with celebration effects

### Mascot Builder
- Users create custom puppet characters (like Tony Automotive)
- Push-button selections for: look, outfit, hairstyle, name on mechanic shirt
- Generated via Gemini image generation
- Mascots integrate with UGC Creator and image tools
- Reference style: Muppet-style fleece puppets
