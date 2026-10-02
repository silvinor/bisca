# Main Game Engine 

This project uses nested **state engines**. The main loop is the main game state. This is a core engine file. Each node is written as a separate file.

Within each file there is its own *mini* state engine. Each node in it is a separate function.

The application runs the main engine in a cooperative asynchronous loop. Each state runs a tick, then a draw, then a wait, in that order, and repeats this until it is ready to move on. This design keeps the browser responsive. It does this without polling and without tying game progress to display animation frames.

**The important thing to understand about this engine** is that it is not an infinite loop or a graphics rendering engine. It is a DOM management engine. This app only draws with native HTML and CSS components: div, img, svg, and CSS absolute or relative coordinates. The state engine does the following:
- On enter: `init` sets up initial variables. It also prepares the first `draw` call in the running loop. This lets the loop render visual items on the DOM, such as cards, dialogs, and buttons.
- On "running": this runs just after `init`, and each time the loop needs it.
    - `tick` handles internal, non-UI tracking, such as card deck changes and settings save or retrieve operations.
    - `draw` applies DOM changes: it adds or removes items and changes their locations.
- On exit: `stop` removes all the DOM UI items.

This loop must block. It also needs a trigger event to loop again: trigger, then tick, then draw, then wait for the next trigger.

**Hard rule:** `tick()` must not wait for anything on its own. It is the non-UI worker. It reads any data the last trigger delivered. It returns the same state to mean stay, or a different state to mean move on now. `draw()` runs after every tick, whether or not the state changed, so the node paints its current state before the loop can block. The wait step comes after `draw()`. It blocks the loop until the next trigger, and only then does the loop run `tick()` again.

`GameState` gives every node the same building blocks for this, so no node writes its own resolver bookkeeping:
- `step()` runs the tick, draw, and wait steps in a loop. It repeats until `tick()` returns a state that differs from the state the node held at the start of that pass.
- When a node needs trigger data, `tick()` reads the latest one from `this.lastTrigger`.
- An event handler, from `reactions.ts`, a timer, or similar, calls `node.trigger(payload)`. This is the one well-known call that makes the loop cycle over: it stores the payload in `this.lastTrigger` and releases the pending wait.

A node with no payload uses `GameState<StateMain>` (`TriggerPayload` defaults to `void`) and calls `node.trigger()`. A node whose trigger carries data, such as the chosen game mode, extends `GameState<StateMain, GameMode>`, and its `tick()` reads that data from `this.lastTrigger`. See `src/core/state-mode.ts` for the reference example.

## Main State Engine

```mermaid
stateDiagram-v2
    state "Main Loop" as MAIN {
        direction TB
        state "GAME_STATE_INIT" as INIT : (On page entry or refresh)
        state if_1 <<choice>>
        state "GAME_STATE_SPLASH" as SPLASH : Display logo
        state "GAME_STATE_GAME_MODE" as GAME_MODE : Game mode, difficulty & sets
        state "GAME_STATE_SELECT_DEALER" as SELECT_DEALER : Select Dealer sequence
        state "GAME_STATE_PLAY" as PLAY : Main play sequence
        state "GAME_STATE_WIN_LOSE" as WIN_LOSE : Winner/Loser sequence
    }
    
    state "GAME_STATE_SETTINGS<br/>Deck, Back, Color etc." as SETTINGS
    state "GAME_STATE_HELP" as HELP : Help Screen

    [*] --> INIT
    INIT --> if_1
    if_1 --> SPLASH : No game in play
    if_1 --> PLAY : Prior game in persistence
    if_1 --> SELECT_DEALER : Mode selected but not in play
    SPLASH --> GAME_MODE
    GAME_MODE --> SELECT_DEALER
    SELECT_DEALER --> PLAY
    PLAY --> WIN_LOSE

    WIN_LOSE --> GAME_MODE : Loop

    GAME_MODE --> SETTINGS : ⚑
    SETTINGS --> GAME_MODE : ⚐
    GAME_MODE --> HELP : ⚑
    HELP --> GAME_MODE : ⚐

    PLAY --> SETTINGS : ⚑
    SETTINGS --> PLAY : ⚐
    PLAY --> HELP : ⚑
    HELP --> PLAY : ⚐

    SELECT_DEALER --> SETTINGS : ⚑
    SETTINGS --> SELECT_DEALER : ⚐
    SELECT_DEALER --> HELP : ⚑
    HELP --> SELECT_DEALER : ⚐

    SELECT_DEALER --> GAME_MODE : ×
    PLAY --> GAME_MODE : × (Are you sure?)
```

*Note:* **⚑⚐** → You can select both `SETTINGS` and `HELP` at any time. When one finishes, it returns to the calling state.

**How ⚑⚐ works:** Opening an overlay is an interrupt, not a normal transition. `gameEngine.openOverlay(state)` stops whatever node is current, pushes it onto a FILO stack, and starts the overlay. This works from any node, at any time, because it does not go through that node's own `tick()`. `SETTINGS` and `HELP` can open each other the same way, so the stack can hold more than one saved node.

Closing an overlay IS a normal transition, driven by that overlay's own `tick()`. The global close button calls `trigger()` on the active overlay node. Its `tock()` sees `this.triggered` and returns `StateMain.RESUME`. `StateMain.RESUME` is not a real screen: the engine reads it as "pop the FILO stack and continue whatever node this overlay interrupted," restarting that node with `start()`.

## `INIT` Mini State Engine

```mermaid
stateDiagram-v2

    state "INIT_STATE_INIT" as INIT : Load saved persistence
    state "INIT_STATE_END" as END

    [*] --> INIT
    INIT --> END
    END --> [*]
```

## `SPLASH` Mini State Engine

```mermaid
stateDiagram-v2

    state "SPLASH_STATE_INIT" as INIT
    state "SPLASH_STATE_ROTATE" as ROTATE : Animate logo
    state "SPLASH_STATE_PAUSE" as PAUSE : Delay
    state "SPLASH_STATE_END<br/>Ends" as END

    [*] --> INIT
    INIT --> ROTATE
    ROTATE --> PAUSE
    PAUSE --> END
    END --> [*]

    INIT --> PAUSE : if No_Animate
```

## `GAME_MODE` Mini State Engine

```mermaid
stateDiagram-v2

    state "GAME_MODE_STATE_INIT" as INIT
    state "GAME_MODE_STATE_PROMPT" as PROMPT : Show (& act) selection screen
    state "GAME_MODE_STATE_END" as END

    [*] --> INIT
    INIT --> PROMPT
    PROMPT --> END
    END --> [*]
```

## `SELECT_DEALER` Mini State Engine

```mermaid
stateDiagram-v2

    state "SELECT_DEALER_STATE_INIT" as INIT
    state "SELECT_DEALER_DRAW" as FAN : Shuffle and show
    state "SELECT_DEALER_USER_PICK" as USER_PICK : Wait for user pick
    state "SELECT_DEALER_COMPUTER_PICK" as COMPUTER_PICK : Computer picks
    state "SELECT_DEALER_EVAL" as EVAL {
      state if_2 <<choice>>
      state "SELECT_DEALER_EQUAL_HIGHEST" as EQUAL_HIGHEST
      state "SELECT_DEALER_USER_HIGHEST" as USER_HIGHEST
      state "SELECT_DEALER_COMPUTER_HIGHEST" as COMPUTER_HIGHEST
    }
    state frk_2 <<fork>>
    state jne_2 <<join>>
    state "SELECT_DEALER_START_PICK_2" as MODE4 {
        state if_3 <<choice>>
        state "SELECT_DEALER_USER_PICK_2" as USER_PICK2 : Wait for user pick
        state "SELECT_DEALER_COMPUTER_PICK_2" as COMPUTER_PICK2 : Computer picks
        state "SELECT_DEALER_DISCARD_2" as DISCARD2 : Remove 2-face card
    }
    state "SELECT_DEALER_STATE_END" as END


    [*] --> INIT
    INIT --> FAN
    FAN --> USER_PICK
    USER_PICK --> COMPUTER_PICK
    COMPUTER_PICK --> EVAL
    EVAL --> if_2
    if_2 --> EQUAL_HIGHEST : More that one high card
    if_2 --> USER_HIGHEST : User has highest
    if_2 --> COMPUTER_HIGHEST : Computer has highest

    EQUAL_HIGHEST --> FAN : Redo

    USER_HIGHEST --> frk_2
    COMPUTER_HIGHEST --> frk_2
    frk_2 --> jne_2 : *(All other modes)*
    jne_2 --> END

    frk_2 --> MODE4 : MODE4
    if_3 --> USER_PICK2 : Dealer is right of user<br>(or last in list)


    if_3 --> COMPUTER_PICK2 : Dealer is any other
    MODE4 --> if_3
    USER_PICK2 --> DISCARD2
    COMPUTER_PICK2 --> DISCARD2

    DISCARD2 --> jne_2

    END --> [*]
```

## `PLAY` Mini State Engine

```mermaid
stateDiagram-v2

    state "PLAY_STATE_INIT" as INIT
    state "PLAY_STATE_END" as END

    [*] --> INIT
    INIT --> END : <<< TODO >>>
    END --> [*]
```
## `WIN_LOSE` Mini State Engine

```mermaid
stateDiagram-v2

    state "WIN_LOSE_STATE_INIT" as INIT
    state "WIN_LOSE_STATE_END" as END

    [*] --> INIT
    INIT --> END : <<< TODO >>>
    END --> [*]
```

## Class Diagram

```mermaid
classDiagram
    direction RL

    class GameState {
        <<abstract>>
        #State currentState
        -boolean running
        +start() void
        +step() Promise~State~
        +render() void
        +frame() Promise~void~
        +stop() void
        +State state
        +boolean finished
        #init() void
        #tick(lastState: State) State | Promise~State~
        #draw(currentState: State) void
        #end() void
    }
    class MainGameEngine {
        -StateMain returnTo
        -StateOverlay requestedOverlay
        +openOverlay(overlay: StateOverlay) void
        +closeOverlay() void
        -nextState(state: StateMain) StateMain
    }
    class OverlayScreen {
        +show() void
        +hide() void
    }
    class InitGameState 
    class SplashGameState
    class GameModeGameState
    class SelectDealerGameState
    class PlayGameState
    class WinLoseGameState
    class SettingsScreen
    class HelpScreen

    GameState --|> MainGameEngine : inherits
    GameState --|> InitGameState : inherits
    GameState --|> SplashGameState : inherits
    GameState --|> GameModeGameState : inherits
    GameState --|> SelectDealerGameState : inherits
    GameState --|> PlayGameState : inherits
    GameState --|> WinLoseGameState : inherits
    OverlayScreen --|> SettingsScreen : inherits
    OverlayScreen --|> HelpScreen : inherits

    MainGameEngine --> InitGameState : runs
    MainGameEngine --> SplashGameState : runs
    MainGameEngine --> GameModeGameState : runs
    MainGameEngine --> SelectDealerGameState : runs
    MainGameEngine --> PlayGameState : runs
    MainGameEngine --> WinLoseGameState : runs
    MainGameEngine --> SettingsScreen : displays
    MainGameEngine --> HelpScreen : displays
```

## Interfaces & Enums

```mermaid
classDiagram
    class StateMain {
        <<enumeration>>
        INIT
        SPLASH
        GAME_MODE
        PLAY
        SELECT_DEALER
        PLAY
        WIN_LOSE
    }

    class StateOverlay {
        <<enumeration>>
        SETTINGS
        HELP
    }
```
