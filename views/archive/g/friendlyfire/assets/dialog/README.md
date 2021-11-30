# Dialogs

One dialog is one or multiple conversations between an NPC and the player about the same topic. It's possible
that the conversation is temporarily ended (e.g. because the player offended the NPC, or because the player
decides to end the conversation (if possible) to return to it at a later point), but the NPC will remember
what state it was in and continue from there with the next conversation.

One NPC can thus be part of multiple Dialogs over time as the game progresses.

Dialogs are self enclosed, that means the NPC cannot access the contents of another dialog in any way.
Cross references are possible within a single dialog, where player reactions can cause the NPC to jump
to any of a number of possible states in the conversation. These references are often one-way, but
it's also possible to backtrac or even add cycles to the conversation.

## Syntax

One dialog is a JSON file, containing an object with any number of keys, which represent individual
states that can be jumped to. There should always be an "entry" key, which is the state the conversation
will start with when the player starts it for the very first time.
Each of these keys holds an array of strings, which are twofold: Either a player option (marked by an
initial "►"), or an NPC line. Each line may end with a state change and or an action.

### State Changes

Usually after player options, but can also be placed after NPC lines. State changes always begin with
an "@" character followed by a valid key name form within the same dialog. After the line has been
spoken by NPC or player, the dialog will continue in that state (with its first line).

### Actions

Any kind of side effect in the game. Always starts with an exclamation mark, followed by the action name
and possibly additional parameters. Includes camera behavior (e.g. "!zoomin", "!zoomout", "!zoomto &lt;NPC name&gt;"),
NPC moods ("!angry", "!scared", … whatever we support), game progress ("!enabledialog &lt;NPC name&gt; &lt;dialog name&gt;")
and more.

### Interpretation

Lines are always executed top to bottom. If multiple NPC lines follow one another, the player will have
to press Enter to proceed to the next one. When an NPC line is followed by player options, the player will
see both at the same time. Multiple options after one another will always be visible at once.
It's possible to have one player option lead to more player options using state changes though:

```json
    …
    "myState": [
        "I'm NPC XY and say stuff",
        "►Greet",
        "►Leave !end",
        "►Insult @insults"
    ],
    "insults": [
        "►You're heavy!",
        "►I don't like you"
    ]
```

Having many states can quickly become hard to read though.
It's sometimes possible to not use all that many states for every single player option,
but stay mostly in a single one linearly:

```json
    …
    "entry": [
        "Hello you!",
        "►Hi", /* all these lead to the same line below, mere illusion of choice! */
        "►Hello you too!",
        "►Who are you?",
        "I'm Steve the sentient stone!",
        "►Whoa! A talking stone!",
        "►You rock!",
        "►What do you want from me? @want",
        "Well yes, thank you! And you are?"
    ]
    …
```

This way even longer conversations don't need to turn complex.
