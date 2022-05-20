
<!-- Gitalk 评论 start  -->
{% if site.gitalk.enable %}
<!-- Link Gitalk 的支持文件  -->
<link rel="stylesheet" href="https://unpkg.com/gitalk/dist/gitalk.css">
<script src="https://unpkg.com/gitalk@latest/dist/gitalk.min.js"></script>

<div id="gitalk-container"></div>
    <script type="text/javascript">
    var gitalk = new Gitalk({
    // gitalk的主要参数
	clientID: 4dede977f9d18025b3b5,
	clientSecret: 993a40becb3f6e9bb2da6565ca2cbb9b486624f8,
	repo: xie96808.github.io,
	owner: xie96808,
	admin: [xie96808],
	id: xie96808.github.io/_posts,
    	distractionFreeMode: false  // Facebook-like distraction free mode
    });
    gitalk.render('gitalk-container');
</script>
{% endif %}
<!-- Gitalk end -->
