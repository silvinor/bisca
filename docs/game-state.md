# Main Game Engine 

Nested **state engines** used.  The main loop is the main game state.  This is a core engine file.  Each node then is written as a separate file. 

Within each file there is it's own *mini* state engine.  Each node therein is a separate function.

The application runs the main engine in a cooperative asynchronous loop. Each
`tick()` either returns immediately when its state can progress, or awaits the
event that allows a waiting state to continue. This keeps the browser responsive
without polling or tying game progression to display animation frames.

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

```

*Note:* **⚑⚐** → Both `SETTINGS` and `HELP` can be selected at any time, and return to calling state when done.

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
    state "SELECT_DEALER_FAN" as FAN : Shuffle and show
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
