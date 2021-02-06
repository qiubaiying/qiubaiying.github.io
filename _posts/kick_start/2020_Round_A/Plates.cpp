#include<bits/stdc++.h>
using namespace std;

#define ll long long 
#define ar array

int n, k , p, a[51][31];
int dp[51][1051];
void solve(){
// dp
	int res;
	cin >> n >> k >> p;
	memset(dp, 0xc0, sizeof(dp));
	dp[0][0] = 0;
	for(int i = 0 ; i < n; i++){
		memcpy(dp[i + 1], dp[i], sizeof(dp[0]));
		for(int j = 0,  sum = 0; j < k ;j++){
			cin >> a[i][j];
			sum += a[i][j];
			for(int l = 0;  l + j + 1 < p ; l ++){
				dp[i][j] = max(dp[i][j] + sum, dp[i + 1][l +j +1]);
			}

		}
	}
	cout << dp[n][p];
}


int main(){
	ios::sync_with_stdio(0);
	cin.tie(0);
	
	int t;

	int i = 0;
	cin >> t;
	while(t--){
		cout << "Case #"<< ++i << ": "; 
		solve();
		cout << endl;
	}
}
