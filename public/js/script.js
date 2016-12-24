

$(function() {
	$('.remove').on('click', function(){
		var id = this.id;
		if (confirm("Are You Delete this item")) {
			$.ajax({
				url: '/delete/'+id,
				type: 'DELETE'
			}).then(function(res){
				console.log(res);
				window.location.href= '/'
			}, function(err){
				console.log('errer deleye item'+ err);
			})
		}
	})
});