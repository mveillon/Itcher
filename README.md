# Itcher
This codebase uses machine learning to select what pitch the pitcher should throw next based on the game state and information about the pitcher's repertoire.

The models have been trained using pitch by pitch data from 2019 found [here](https://www.kaggle.com/datasets/pschale/mlb-pitch-data-20152018?resource=download).

# Mac/Linux
To install, first download the code. Because of the requirements of some of the dependencies, the path to the root must not have any spaces. We recommend leaving it in your Downloads folder or placing it in your Desktop or Documents folder. Then open Terminal and `cd` into the root directory (on Mac, you can drag the folder from Finder to Terminal to copy the absolute path). Run `npm install` to install all the dependencies and run `npm run run-server` to start the local host and open the HTML in your browser.

# Windows
Not yet supported because I don't have a Windows machine. It might work on Windows, but I doubt it ¯\\\_(ツ)\_/¯. 

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

The way the machine learning works is not completely intuitive, because the intuitive methods frankly did not perform well at all. The parent model is an ensemble of polynomial regression models, each trained on a subset of the pitch-by-pitch data from Kaggle. What makes the machinery unintuitive is these polynomial regression models are actually trained as *classifiers*, each predicting, given the current game state and information about the pitch being thrown, whether the pitch will result in a *good* outcome or a *bad* outcome. The bagging parent model averages these classifications to approximate the probability of a good outcome, and these aggregations are used as the weights for the random selection.

# Why Use This
Long story short, this code provides better optimality as well as better randomness. 

Starting with the randomness, numerous studies have embarked on the project of predicting what pitch the opposing pitcher will throw next. [This study](https://towardsai.net/p/machine-learning/baseball-pitch-prediction) by Towards AI was able to predict the correct pitch type 67.35% of the time. Moreover, this study was predicting specific pitch types, i.e. 4-seam fastball and 2-seam fastball were considered different pitches. Many batters would likely see great improvement even if they only knew whether the next pitch would be a fastball as opposed to a breaking ball, and a machine learning model with that simpler task would likely perform even better. 

This code would be impossible to predict reliably because it uses a much truer randomness than what an MLB pitcher/catcher/manager can come up with while also trying to pay attention to everything else happening in the game. The average probability of Itcher selecting the pitch it ends up selecting is 18.3%, which provides a hard ceiling for the accuracy of any human or machine trying to predict it.

Along with the randomness, the pitches this model suggests would perform better than the pitches selected in the dataset. Sticking to the framework of measuring outcomes based on the binary of whether they were good or bad for the pitcher, unsurprisingly, as currently chosen, a given pitch is good for the pitcher about 50% of the time. The specific figure is 51.2%. Based on the machine learning's valuation, the pitch the model selects would give the pitcher a good outcome 58.7% of the time.

However, we still have to factor in the model's inaccuracy. The model uses a bagging ensemble, which means the 0.587 roughly translates to 587 models predicting a good outcome while 1000 - 587 = 413 models predict a bad outcome (we don't actually use 1000 models but this is just for illustration). The average child model has an accuracy of 70.5%, and if 70.5% of those 587 "good" models are right, that results in 0.705 * 587 = 413.835 good outcomes, and (1 - 0.705) * 587 = 173.165 bad outcomes. When we do the same with the "bad" models, we get 0.705 * 413 = 291.165 bad outcomes and (1 - 0.705) * 413 = 121.835 good outcomes. This means, adjusting for the inaccuracy, we get about 413.835 + 121.835 = 535.67 good outcomes, i.e. a 53.6% chance of a good outcome. This estimate is more conservative, which makes sense since it is taking the model's output with a grain of salt. 

We can convert these figures to a run value by measuring the wOBA before and after the pitch, and then using that to find the wRAA over a full season. Note that the training data is originally categorized into "good" and "bad" events based on this difference in wOBA, although the magnitude is lost. 

For pitches that resulted in a "good" event, the average wOBA difference before and after is -0.145 (negative is good for the pitcher). Pitches that resulted in a "bad" event averaged a wOBA difference of 0.155. The selected pitch thus has an average wOBA difference of 0.512 * -0.145 + (1 - 0.512) * 0.155 = 0.0014, which is unsurprisingly basically zero. On the other hand, this code's selected pitch has an average wOBA difference of 0.536 * -0.145 + (1 - 0.536) * 0.155 = -0.0058. 

In the dataset Itcher uses, there was an average of 3.87 pitchers per plate appearance. Each pitch Itcher suggests lowers the batter's wOBA by 0.0058, meaning over the course of a full plate appearance, this accumulates to a difference of -0.0058 * 3.87 = -0.022446.

The league-average pitch by definition allows the league-average wOBA. This project uses 2019 data, and in 2019 the league-wide wOBA was 0.320, the wOBA scale was 1.157, and the number of runs per plate appearance was 0.126 (all figures from [fangraphs](https://www.fangraphs.com/guts.aspx?type=cn)). A plate apperance using pitches selected from Itcher would thus have a wOBA of 0.320 - 0.022446 = 0.297554. 

In 2019, the average team faced 38.39 batters per game (from [here](https://www.baseball-reference.com/leagues/majors/pitch.shtml)), meaning 38.39 * 162 = 6219.18 per season. To see how valuable a 0.298 wOBA over 6219.18 plate appearances is, it's easiest to convert the figures to wRAA. Using [this formula](https://library.fangraphs.com/offense/wraa/), we find wRAA = ((0.297554 - 0.320) / 1.157) * 6219.18 = -120.65314926, which is to say that a team using Itcher over a full season would allow something on the order of 120.65 fewer runs than the same team not using Itcher. 

Note that this is a somewhat different calculation than what a sabermetrician is typically used to when converted a *player's* wOBA to a run value. Because the team can use Itcher for every pitcher in every game, a smaller difference in wOBA adds up to a much larger difference in runs compared to a single starting pitcher with a 0.298 wOBA allowed.

Fangraphs calculates the amount of runs per win using the formula [here](https://library.fangraphs.com/misc/war/converting-runs-to-wins/). In 2019, this figure was 4.83 * 1.5 + 3 = 10.245 (runs per game from [here](https://www.baseball-reference.com/leagues/majors/pitch.shtml)), meaning that runs saved figure trainslates to 120.65314926 / 10.245 = 11.77678372 wins over a full season. 

Using Itcher provides a team with 11.78 extra wins. If Itcher were a free agent, it would be worth $6.37 million per win * 11.78 wins = $75.02 million dollars in 2022 for just one year. (Dollars per win from [here](https://blogs.fangraphs.com/what-did-teams-pay-per-win-in-free-agency/).)