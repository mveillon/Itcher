# Itcher
This codebase uses machine learning to select what pitch the pitcher should throw next based on the game state. 

The models have been trained using pitch by pitch data from 2019 found [here](https://www.kaggle.com/datasets/pschale/mlb-pitch-data-20152018?resource=download).

# Mac/Linux
To install, first download the code. Because of the requirements of some of the dependencies, the path to the root must not have any spaces. We recommend leaving it in your Downloads folder or placing it in your Desktop or Documents folder. Then open Terminal and `cd` into the root directory (you can drag the folder from Finder to Terminal to copy the absolute path). Run `npm install` to install all the dependencies and run `npm run run-server` to start the local host and open the HTML in your browser.

# Windows
Not yet supported because I don't have a Windows machine. 

# Usage

Once open, the user can select one of a number of different events that update the game state and make the pitch recommendations more effective. To the right of these buttons is a scorebug-like display of the current game state. If something ever goes wrong, the user can click on anything in that scorebug to change it manually. 

The pitch recommendation is refreshed every time the state changes, and will always be a pitch that the current pitcher throws. To change the available pitches, the user can change the pitcher by selecting the current pitcher's name from the dropdown menu. The user can also change the handedness of the batter and the lineup generally by clicking on the current batter's handedness. 

# Typical Use Flow

1. Run the code using `npm run run-server` and wait for the machine learning to load.
1. Click on the **Pitching: Unknown (change me!)** button and input the current pitcher.
1. Click on the **Batter: L** button to input the handedness of the current lineup. Follow the format already shown, i.e. only input *L*, *R*, or *S*, and make sure each spot is separated by a comma. Spaces before or after the comma do not matter, and neither does the case of the lineup. The handednesses are in order; the first *L* corresponds to the leadoff hitter, the second *R* corresponds to the 2-hitter, etc.
1. Throw the suggested pitch and click the button that corresponds to what happened afterwards. E.g. if the pitch was a ball, click the button that says **Ball**. If you ever click the wrong button, or the button does not do what you expect, you can either manually change the scorebug on the right or click the **Undo** button. You can change the bases by clicking them; you can do the same with the number of outs. Finally, you can increase or decrease the count by pushing the buttons above and below each zero. If you don't like the suggested pitch, you can get a new one by clicking the box showing the pitch.

# How It Works
At a high level, this codebase goes through each pitch the current pitcher can throw and combines information about that pitch (average velocity, spin rate, etc.) with the current game state to predict how good of an outcome will result from throwing that pitch. Once that information is aggregated, those predictions can be used as weights in the random selection of the next pitch to throw. If the machine learning says a 4-seam fastball will be better for the pitcher than a curveball, then the code will be more likely to suggest a 4-seamer than the curveball. It will not always suggest a 4-seamer though, because the predictability would undermine the optimality. 

The way the machine learning works is not completely intuitive, because the intuitive methods frankly did not perform well at all. The parent model is an ensemble of polynomial regression models, each trained on a subset of the pitch-by-pitch data from Kaggle. What makes the machinery unintuitive is these polynomial regression models are actually trained as *classifiers*, each predicting, given the current game state and information about the pitch being thrown, whether the pitch will result in a *good* outcome or a *bad* outcome. The parent model averages these classifications to approximate the probability of a good outcome, and these aggregations are used as the weights for the random selection.
