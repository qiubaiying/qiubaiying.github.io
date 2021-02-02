## CP Handbook



#include <bits/stdc++.h>









#### kick start template

```c++
#include<bits/stdc++.h>
using namespace std;

#define ll long long
#define ar array

void solve(){
	int n ,k, s;
	int total_r, total_b  = 0;
	cin >> n >> k >> s;
	total_r += k - 1;
	total_b += k - 1;
	// restart
	total_r += 1 + n;
	// back
	total_b += (k - s) + (n - s + 1);

	cout << min(total_r, total_b) << endl;
}

int main(){
	ios::sync_with_stdio(0);
	cin.tie(0);
	int t, i = 1;
	cin >> t;
	while(t--){
		cout << "Case #" << i << ": ";
		solve();
		i++;
	}
}
```

