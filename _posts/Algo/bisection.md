## Find number

```c++
int biSection(vector<int> &num, int target){
    int left = 0;
    int right = int(num.size())  -1;
    while (left <= right){
        int mid = left + (right - left) / 2;
        if(num[mid] < target){
            left = mid + 1;
        }
        else if(num[mid] > target){
            right = mid - 1;
        }
        else if(num[mid] == target){
            return mid;
        }
    }
    return -1;
}
```



## Left border

```c++
int biSection(vector<int> &num, int target){
    int left = 0;
    int right = int(num.size())  -1;
    while (left <= right){
        int mid = left + (right - left) / 2;
        if(num[mid] < target){
            left = mid + 1;
        }
        else if(num[mid] > target){
            right = mid - 1;
        }
        else if(num[mid] == target){
            right = mid - 1;
        }
    }
    if(left > num.size() || num[left] != target)
        return -1;
    return left;
}
```





## right border

```c++
int biSection(vector<int> &num, int target){
    int left = 0;
    int right = int(num.size())  -1;
    while (left <= right){
        int mid = left + (right - left) / 2;
        if(num[mid] < target){
            left = mid + 1;
        }
        else if(num[mid] > target){
            right = mid - 1;
        }
        else if(num[mid] == target){
            left = mid + 1;
        }
    }
    if( right < 0 || num[right] != target)
        return -1;
    return right;
}
```