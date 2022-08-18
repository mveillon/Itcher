# Pitch-Chooser-AI
This codebase uses machine learning to select what pitch the pitcher should throw next based on the game state. 

# Mac/Linux
To install, first download the code. Because of the requirements of some of the dependencies, the path to the root must not have any spaces. We recommend leaving it in your Downloads folder or placing it in your Desktop or Documents folder. Then open Terminal and `cd` into the root directory (you can drag the folder from Finder to Terminal to copy the absolute path). Run `npm install` to install all the dependencies and run `npm run-server` to start the local host and open the HTML in your browser.

# Windows
Not yet supported because I don't have a Windows machine. 

# Usage

Once open, the user can select one of a number of different events that update the game state and make the pitch recommendations more effective. To the right of these buttons is a scorebug-like display of the current game state. If something ever goes wrong, the user can click on anything in that scorebug to change it manually. 

The pitch recommendation is refreshed every time the state changes, and will always be a pitch that the current pitcher throws. To change the available pitches, the user can change the pitcher by selecting the current pitcher's name from the dropdown menu. The user can also change the handedness of the batter and the lineup generally by clicking on the current batter's handedness. 

# Typical Use Flow

1. Run the code using `npm run server` and wait for the machine learning to load.
1. Click on the "Pitching: Unknown (change me!)" button and input the current pitcher.
1. Click on the "Batter: L" button to input the handedness of the current lineup. Follow the format already shown, i.e. only input 'L', 'R', or 'S', and make sure each spot is separated by a comma. Spaces before or after the comma do not matter, and neither does the case of the lineup. The handednesses are in order; the first 'L' corresponds to the leadoff hitter, the second 'R' corresponds to the 2-hitter, etc.
1. Throw the suggested pitch and click the button that corresponds to what happened afterwards. E.g. if the pitch was a ball, click the button that says "ball". If you ever click the wrong button, or the button does not do what you expect, you can manually change the scorebug on the right. You can change the bases by clicking them; you can do the same with the number of outs. Finally, you can increase or decrease the count by pushing the buttons above and below each zero.

The models have been trained using pitch by pitch data from 2019 found [here](https://www.kaggle.com/datasets/pschale/mlb-pitch-data-20152018?resource=download).