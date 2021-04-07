#include<bits/stdc++.h>
using namespace std;

#define ll long long
const int mxN=1e3;
int up[mxN][mxN], down[mxN][mxN], lft[mxN][mxN], rght[mxN][mxN];

int calc(int x, int y) {
    return max(min(x/2, y)-1, 0)+max(min(y/2, x)-1, 0);
}


void solve() {
    int r, c;
    cin >> r >> c;
    vector<vector<int>> arr(r, vector<int>(c));
    for(int i = 0 ; i < r ; i++){
        for(int j = 0; j < c; j++){
            cin >> arr[i][j];
        }
    }
    for(int i = 0 ;  i < r; i++){
        for(int j = 0  ; j < c ; j++){
            up[i][j] = arr[i][j] ? 1 + ( i ? up[i-1][j] : 0 ) : 0;
        }
    }

    for(int i = 0 ;  i < r; i++){
        for(int j = 0  ; j < c ; j++){
            down[i][j]=arr[i][j]?1+(i+1<r?down[i+1][j]:0):0;
        }
    }
    for(int i = 0 ;  i < r; i++){
        for(int j = 0  ; j < c ; j++){
            lft[i][j]=arr[i][j]?1+(j?lft[i][j-1]:0):0;
        }
    }
    for(int i = 0 ;  i < r; i++){
        for(int j = 0  ; j < c ; j++){
            rght[i][j]=arr[i][j]?1+(j+1<c?rght[i][j+1]:0):0;
        }
    }

    ll ans=0;

    for(int i = 0 ;  i < r; i++){
        for(int j = 0  ; j < c ; j++){
            ans+=calc(up[i][j], lft[i][j])+calc(up[i][j], rght[i][j])+calc(down[i][j], lft[i][j])+calc(down[i][j], rght[i][j]);
        }
    }
    cout << ans << endl;
}

int main() {
    ios::sync_with_stdio(0);
    cin.tie(0);

    int t=1;
    cin >> t;
    int i = 0;
    for(int j = 0 ; j < t;  j++){
        cout << "Case #" << i+1 << ": ";
        solve();
    }
}