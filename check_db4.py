from yaksh.models import Quiz  
q = Quiz.objects.last()  
print(" "SEB_REQ:, getattr(q, is_seb_required, None))  
