inputfile=$1

 cat $inputfile | while read line
do
     sh fetch_one.sh ${line}
 done




