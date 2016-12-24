

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

	// $('#formEditModal').on('submit', editRecipe)
	// function editRecipe() {
	// 	var data = {
	// 		title : $('#title').val(),
	// 		ingredient : $('#ingredient').val(),
	// 		process : $('#process').val(),
	// 		time : $('#time').val(),
	// 		cooked_by : $('#cooked_by').val(),
	// 		source : $('#source').val(),
	// 	}
	// 	console.log(data);

	// }
});