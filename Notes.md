**August 15**
NOTE: when filtering for items in the database, hold the positions of each key value pair's position in a variable incase an append is required on work being done for this instance of filtering.

**August 22**
Status: You can now find item location in file when given a list of quiered items that need to be replaced. The atttempt is to replace the text within location using a stream write that overwrites starting from the location found. Several concerns...

-Need to check to make sure the new item being written is not longer than what is being replaced. If it is, it will overwrite data that is not meant to be over written. Will need to figure out a solution that will move items several places "down" the file. 

**August 27**
-Use a buffer to contain the item that needs to be edited. Append the buffer in the location.
-See bottom of code for concat

**Septemeber 7**
Redo FileWriteStream so it uses position to do initial writing and everytime it writes it updates the position so it does not write over anything. 

**September 10**
The write stream works, and appends on the proper place. Had to change flag to R+ to append or it will create a null filled file for old items
***THINGS TO FIX***(Fixed 09/11/25)
The append should not work though, since its a copy of an exisiting item