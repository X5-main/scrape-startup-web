jQuery(document).ready(function ($) {

  function loadPosts(department) {
    const wrapper = $('#positions');

    $.ajax({
      url: window.theme_data.ajax_url,
      type: 'POST',
      data: {
        action: 'filter_positions',
        department: department,
      },
      beforeSend: function () {
        wrapper.addClass('--loading');
      },
      success: function (response) {
        wrapper.html(response.data.html);
        $('#count').text(response.data.count);
      },
      complete: function () {
        wrapper.removeClass('--loading');
      }
    });
  }

  $(document).on('click', '.filter-positions', function (e) {
    e.preventDefault();
    let id = $(this).data('id');
    $('.filter-positions').removeClass('isActive');
    $(this).addClass('isActive');
    if (id === 'all') {
      loadPosts(false);
    } else {
      loadPosts(id);
    }
  });

  let timer;
  $('#blogSearch').on('input', function () {
    const search = $(this).val();
    const category = $(this).data('category');

    clearTimeout(timer);

    timer = setTimeout(function () {

      $.ajax({
        url: window.theme_data.ajax_url,
        type: 'POST',
        data: {
          action: 'blog_search',
          search: search,
          category: category
        },
        success: function (response) {
          $('#postsContainer').html(response);
        }
      });

    }, 400);

  });

  $('#resetSearch').on('click', function () {
    $('#blogSearch').val('');
    $.ajax({
      url: window.theme_data.ajax_url,
      type: 'POST',
      data: {
        action: 'blog_search',
      },
      success: function (response) {
        $('#postsContainer').html(response);
      }
    });
  });
});