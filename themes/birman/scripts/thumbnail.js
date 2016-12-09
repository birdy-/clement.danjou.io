/**
* Thumbnail Helper
* @description Get the thumbnail url from a post
* @example
*     <%- thumbnail(post) %>
*/
hexo.extend.helper.register('thumbnail', function (post, large = false) {
    var url = post.cover || '';
    if (!url) return '';
    var prefix = '/images/';
    if (!large) prefix += 'largeThumb-';
    return prefix + url;
});
