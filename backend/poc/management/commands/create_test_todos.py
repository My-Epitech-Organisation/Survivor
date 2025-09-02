from django.core.management.base import BaseCommand
from poc.models import Todo

class Command(BaseCommand):
    help = 'Créer des todos de test'

    def handle(self, *args, **options):
        # Supprimer les todos existants
        Todo.objects.all().delete()
        
        # Créer des todos de test
        todos = [
            {"title": "Apprendre Django", "description": "Créer une API REST avec Django", "completed": False},
            {"title": "Setup Docker", "description": "Configurer Docker pour le projet", "completed": True},
            {"title": "Implement WebSockets", "description": "Ajouter Socket.IO pour les temps réel", "completed": False},
        ]
        
        for todo_data in todos:
            Todo.objects.create(**todo_data)
            self.stdout.write(f"Créé: {todo_data['title']}")
        
        self.stdout.write(self.style.SUCCESS('Tous les todos de test ont été créés!'))
