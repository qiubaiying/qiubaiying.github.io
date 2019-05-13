
filename=$1

if [ "$filename" = "" ]; then 
    echo "empty line, ignore it"
fi

ls |grep "$filename"
r=$?


if [ $r == 1 ]; then
  wget https://cdn.assets.scratch.mit.edu/internalapi/asset/$filename/get/ -O $filename      
elif [ $r == 0 ]; then
        echo "already exist $filename"
fi















