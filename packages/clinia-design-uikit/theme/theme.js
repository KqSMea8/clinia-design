exports.reader = function(post) {
  var filename = post.meta.filepath.toLowerCase();
  if (filename.indexOf('components') >= 0) {
    post.template = post.meta.template = 'component';
  } else {
    post.template = post.meta.template = (post.meta.template || 'page');
  }
  if (filename === 'readme.md') {
    post.filename = post.meta.filename = 'index';
    post.meta.category = 'docs';
  }
  if (!post.meta.category) {
    post.meta.category = post.meta.directory;
  }
  return post;
};
