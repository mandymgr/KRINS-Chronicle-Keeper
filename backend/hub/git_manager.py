"""
KRINS Developer Hub - Git Operations Manager
Real Git operations using GitPython - NO MOCK DATA
"""

import git
import subprocess
from datetime import datetime
from typing import Dict, List, Optional
import logging
import os

logger = logging.getLogger(__name__)

class GitManager:
    def __init__(self, repo_path: str = None):
        self.repo_path = repo_path or '/Users/mandymarigjervikrygg/Desktop/Krins-Studio/KRINS-Chronicle-Keeper'
        self.repo = None
        self.connect()
    
    def connect(self):
        """Connect to Git repository"""
        try:
            self.repo = git.Repo(self.repo_path)
            logger.info(f"Connected to Git repository at {self.repo_path}")
        except git.InvalidGitRepositoryError:
            logger.error(f"Invalid Git repository at {self.repo_path}")
            self.repo = None
        except Exception as e:
            logger.error(f"Failed to connect to Git repository: {e}")
            self.repo = None
    
    async def get_status(self) -> Dict:
        """Get real Git repository status"""
        if not self.repo:
            return {'error': 'No Git repository connected'}
        
        try:
            # Current branch
            current_branch = self.repo.active_branch.name
            
            # Check for dirty files (uncommitted changes)
            dirty = self.repo.is_dirty(untracked_files=True)
            
            # Get ahead/behind information
            ahead = 0
            behind = 0
            try:
                # Compare with origin/current_branch
                origin_branch = f"origin/{current_branch}"
                if origin_branch in [ref.name for ref in self.repo.refs]:
                    ahead = len(list(self.repo.iter_commits(f'{origin_branch}..HEAD')))
                    behind = len(list(self.repo.iter_commits(f'HEAD..{origin_branch}')))
            except Exception as e:
                logger.warning(f"Failed to get ahead/behind info: {e}")
            
            # Last commit info
            last_commit = self.repo.head.commit
            
            # Untracked files
            untracked_files = self.repo.untracked_files
            
            # Modified files
            modified_files = [item.a_path for item in self.repo.index.diff(None)]
            
            # Staged files
            staged_files = [item.a_path for item in self.repo.index.diff("HEAD")]
            
            return {
                'branch': current_branch,
                'dirty': dirty,
                'ahead': ahead,
                'behind': behind,
                'lastCommit': {
                    'hash': last_commit.hexsha[:8],
                    'fullHash': last_commit.hexsha,
                    'message': last_commit.message.strip(),
                    'author': last_commit.author.name,
                    'email': last_commit.author.email,
                    'date': datetime.fromtimestamp(last_commit.committed_date).isoformat()
                },
                'files': {
                    'untracked': untracked_files,
                    'modified': modified_files,
                    'staged': staged_files,
                    'total_changes': len(untracked_files) + len(modified_files) + len(staged_files)
                },
                'remotes': [remote.name for remote in self.repo.remotes],
                'tags': [tag.name for tag in self.repo.tags[-5:]]  # Last 5 tags
            }
            
        except Exception as e:
            logger.error(f"Failed to get Git status: {e}")
            return {'error': str(e)}
    
    async def get_recent_commits(self, limit: int = 50) -> List[Dict]:
        """Get recent commits from repository"""
        if not self.repo:
            return []
        
        try:
            commits = []
            for commit in self.repo.iter_commits(max_count=limit):
                # Get files changed in this commit
                files_changed = []
                if commit.parents:  # Not the initial commit
                    try:
                        diffs = commit.parents[0].diff(commit)
                        files_changed = [diff.a_path or diff.b_path for diff in diffs]
                    except:
                        files_changed = []
                
                # Get commit stats
                stats = commit.stats.total
                
                commits.append({
                    'hash': commit.hexsha[:8],
                    'fullHash': commit.hexsha,
                    'message': commit.message.strip(),
                    'author': commit.author.name,
                    'email': commit.author.email,
                    'date': datetime.fromtimestamp(commit.committed_date).isoformat(),
                    'files': files_changed,
                    'stats': {
                        'additions': stats['insertions'],
                        'deletions': stats['deletions'],
                        'files': stats['files']
                    }
                })
            
            return commits
            
        except Exception as e:
            logger.error(f"Failed to get recent commits: {e}")
            return []
    
    async def get_branch_info(self) -> Dict:
        """Get information about all branches"""
        if not self.repo:
            return {}
        
        try:
            branches = {
                'local': [],
                'remote': [],
                'current': self.repo.active_branch.name if not self.repo.head.is_detached else 'HEAD'
            }
            
            # Local branches
            for branch in self.repo.branches:
                last_commit = branch.commit
                branches['local'].append({
                    'name': branch.name,
                    'active': branch == self.repo.active_branch,
                    'lastCommit': {
                        'hash': last_commit.hexsha[:8],
                        'date': datetime.fromtimestamp(last_commit.committed_date).isoformat(),
                        'message': last_commit.message.strip()[:50]
                    }
                })
            
            # Remote branches
            for remote_ref in self.repo.remotes.origin.refs:
                if remote_ref.name != 'origin/HEAD':
                    branch_name = remote_ref.name.replace('origin/', '')
                    last_commit = remote_ref.commit
                    branches['remote'].append({
                        'name': branch_name,
                        'fullName': remote_ref.name,
                        'lastCommit': {
                            'hash': last_commit.hexsha[:8],
                            'date': datetime.fromtimestamp(last_commit.committed_date).isoformat(),
                            'message': last_commit.message.strip()[:50]
                        }
                    })
            
            return branches
            
        except Exception as e:
            logger.error(f"Failed to get branch info: {e}")
            return {'error': str(e)}
    
    async def run_git_command(self, command: List[str]) -> Dict:
        """Execute raw git command safely"""
        try:
            start_time = datetime.now()
            
            # Whitelist of allowed git commands for security
            allowed_commands = [
                'status', 'log', 'branch', 'remote', 'diff', 'show', 
                'ls-files', 'ls-remote', 'fetch', 'pull'
            ]
            
            if not command or command[0] not in allowed_commands:
                return {
                    'success': False,
                    'error': f"Command '{command[0] if command else 'empty'}' not allowed",
                    'duration': 0,
                    'timestamp': datetime.now().isoformat()
                }
            
            # Execute git command
            result = subprocess.run(
                ['git'] + command,
                capture_output=True,
                text=True,
                cwd=self.repo_path
            )
            
            duration = (datetime.now() - start_time).total_seconds()
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'output': result.stdout,
                    'duration': duration,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'output': result.stdout,
                    'error': result.stderr,
                    'duration': duration,
                    'timestamp': datetime.now().isoformat()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'duration': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    async def get_file_history(self, file_path: str, limit: int = 10) -> List[Dict]:
        """Get commit history for a specific file"""
        if not self.repo:
            return []
        
        try:
            commits = []
            for commit in self.repo.iter_commits(paths=file_path, max_count=limit):
                commits.append({
                    'hash': commit.hexsha[:8],
                    'message': commit.message.strip(),
                    'author': commit.author.name,
                    'date': datetime.fromtimestamp(commit.committed_date).isoformat()
                })
            
            return commits
            
        except Exception as e:
            logger.error(f"Failed to get file history for {file_path}: {e}")
            return []
    
    async def get_repository_stats(self) -> Dict:
        """Get repository statistics"""
        if not self.repo:
            return {}
        
        try:
            # Count commits
            total_commits = len(list(self.repo.iter_commits()))
            
            # Count contributors
            contributors = set()
            for commit in self.repo.iter_commits():
                contributors.add(commit.author.email)
            
            # Get repository size (rough estimate)
            repo_size = 0
            try:
                for root, dirs, files in os.walk(self.repo_path):
                    if '.git' in root:
                        continue
                    for file in files:
                        try:
                            repo_size += os.path.getsize(os.path.join(root, file))
                        except:
                            pass
                repo_size_mb = repo_size / (1024 * 1024)
            except:
                repo_size_mb = 0
            
            return {
                'totalCommits': total_commits,
                'contributors': len(contributors),
                'branches': len(list(self.repo.branches)),
                'tags': len(list(self.repo.tags)),
                'sizemb': round(repo_size_mb, 2),
                'firstCommit': None,  # Would need to iterate all commits
                'lastCommit': {
                    'date': datetime.fromtimestamp(self.repo.head.commit.committed_date).isoformat(),
                    'author': self.repo.head.commit.author.name
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get repository stats: {e}")
            return {'error': str(e)}

# Singleton instance
git_manager = GitManager()