# Pitch-Chooser-AI
This codebase uses machine learning to select what pitch the pitcher should throw next based on the game state. 

# Mac/Linux
To install, first download the code. Because of the requirements of some of the dependencies, the path to the root must not have any spaces. We recommend leaving it in your Downloads folder or placing it in your Desktop or Documents folder. Then open Terminal and `cd` into the root directory (you can drag the folder from Finder to Terminal to copy the absolute path). Run `npm install` to install all the dependencies and run `npm run-server` to start the local host and open the HTML in your browser.

# Windows
Not yet supported because I don't have a Windows machine. 

# Usage

Once open, the user can select one of a number of different events that update the game state and make the pitch recommendations more effective. To the right of these buttons is a scorebug-like display of the current game state. If something ever goes wrong, the user can click on anything in that scorebug to change it manually. 

The pitch recommendation is refreshed every time the state changes, and will always be a pitch that the current pitcher throws. To change the available pitches, the user can change the pitcher by selecting the current pitcher's name from the dropdown menu. The user can also change the handedness of the batter and the lineup generally by clicking on the current batter's handedness. 

The models have been trained using pitch by pitch data from 2019 found [here](https://www.kaggle.com/datasets/pschale/mlb-pitch-data-20152018?resource=download).