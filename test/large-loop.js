function loop(n, seed) {
    let l = seed;
    for (let i = 0; i < n; i = i + 1) {
        l = l * 10;
        while (l > 10000007) {
            l -= 10000007;
        }
    }
    return l
}
