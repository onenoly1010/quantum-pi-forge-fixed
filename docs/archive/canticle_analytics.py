"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CANTICLE ANALYTICS DASHBOARD                              ║
║══════════════════════════════════════════════════════════════════════════════║
║  ARCHIVED: Historical artifact from Quantum Pi Forge governance system.      ║
║                                                                              ║
║  Purpose: Analytics engine for tracking PolicyPaths, Weavers, and ecosystem  ║
║  health metrics within the Canticle governance framework.                    ║
║                                                                              ║
║  Key Components:                                                             ║
║    - PolicyPath: Finalized policy with coherence index, treasury allocation  ║
║    - Weaver: Community contributors with voting power (quanta)               ║
║    - CanticleAnalytics: Dashboard generation and ecosystem health tracking   ║
║                                                                              ║
║  Notable Weavers: @harryjsisson, @mjfree, @jumbarrawa, @waterprotector       ║
║  Policy Paths: Youth Release, Father's Veto                                  ║
║                                                                              ║
║  T=∞ = T=0                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from datetime import datetime, timedelta
import pandas as pd

# Define the data structure classes used throughout the Canticle
class PolicyPath:
    """Represents a finalized policy path in the Canticle ecosystem."""
    def __init__(self, id, name, manifesto, coherence_index, supermajority_percent, treasury_allocated_eth, treasury_percentage, executors, creation_date, impact_metrics):
        self.id = id
        self.name = name
        self.manifesto = manifesto
        self.coherence_index = coherence_index
        self.supermajority_percent = supermajority_percent
        self.treasury_allocated_eth = treasury_allocated_eth
        self.treasury_percentage = treasury_percentage
        self.executors = executors
        self.creation_date = creation_date
        self.impact_metrics = impact_metrics

class Weaver:
    """Represents a contributing member (weaver) with influence metrics."""
    def __init__(self, handle, fragments_submitted, estimated_coherence, estimated_power, status, first_shard):
        self.handle = handle
        self.fragments_submitted = fragments_submitted
        self.estimated_coherence = estimated_coherence
        self.estimated_power = estimated_power
        self.status = status
        self.first_shard = first_shard

class CanticleAnalytics:
    """The base class for managing and reporting on the Canticle's state."""
    
    def __init__(self):
        # Initialize default paths (Pre-fork state)
        self.policy_paths = [
            PolicyPath(
                id=1, name="Youth Release", manifesto="...", coherence_index=0.852,
                supermajority_percent=78.0, treasury_allocated_eth=197000,
                treasury_percentage=35.0, executors=["0xYouthWeaver", "0xCareTaker", "0xYouthACLU"],
                creation_date=datetime.now() - timedelta(days=5),
                impact_metrics={"Youth Amplifier Nodes": 5, "Youth Reached": 10000, "Detained Minors Released": 12, "Education Grants Issued": 45}
            ),
            PolicyPath(
                id=2, name="Father's Veto", manifesto="...", coherence_index=0.830,
                supermajority_percent=76.0, treasury_allocated_eth=250000,
                treasury_percentage=50.0, executors=["0xElderWeaver", "0xCareTaker", "0xJusticeCommons"],
                creation_date=datetime.now() - timedelta(days=3),
                impact_metrics={"Families Supported": 8, "Safety Net Nodes": 3, "Legal Aid Cases": 22, "Temporary Housing Provided": 15}
            ),
        ]
        
        # Initialize default weavers (NOW INCLUDING @waterprotector)
        self.weavers = [
            Weaver(handle="harryjsisson", fragments_submitted=3, estimated_coherence=0.912, estimated_power=1480, status="active", first_shard=datetime.now() - timedelta(days=2)),
            Weaver(handle="mjfree", fragments_submitted=2, estimated_coherence=0.830, estimated_power=1080, status="active", first_shard=datetime.now() - timedelta(days=6)),
            Weaver(handle="jumbarrawa", fragments_submitted=1, estimated_coherence=0.850, estimated_power=550, status="active", first_shard=datetime.now() - timedelta(days=10)),
            Weaver(handle="waterprotector", fragments_submitted=1, estimated_coherence=0.925, estimated_power=1800, status="indigenous_kin", first_shard=datetime.now() - timedelta(hours=1)) # NEW WEAVER
        ]
        
        # Initialize default simulated impact
        self.simulated_impact = {
            "total_treasury_allocated": 447000,
            "ecosystem_coherence": 0.81,
            "community_growth_rate": 1.0,
            "policy_adoption_rate": 0.4,
            "voter_participation": 0.75,
            "fragment_diversity": 1.0
        }

    # --- Analytics Generation Methods ---

    def generate_onboarding_funnel(self):
        """Generates key metrics for the weaver community."""
        total_weavers = len(self.weavers)
        climate_champions = len([w for w in self.weavers if w.status == "climate_champion"])
        total_power = sum(w.estimated_power for w in self.weavers)
        avg_coherence = sum(w.estimated_coherence for w in self.weavers) / total_weavers if total_weavers > 0 else 0
        
        return {
            "total_invited": 4, # Updated total invited
            "onboarded": total_weavers,
            "active_weavers": len([w for w in self.weavers if w.status != "dormant"]),
            "climate_champions": climate_champions,
            "onboarding_rate": 1.0,
            "avg_coherence": avg_coherence,
            "total_voting_power": total_power
        }

    def generate_policy_comparison(self):
        """Generates a comparison dataframe/list for policy paths."""
        data = []
        for policy in self.policy_paths:
            # Mocking impact score based on policy ID/alignment
            if policy.id == 1: impact_score = 72.5
            elif policy.id == 2: impact_score = 68.0
            elif policy.id == 5: impact_score = 88.5
            else: impact_score = 0.0

            data.append({
                "Policy": policy.name,
                "Coherence Index": policy.coherence_index,
                "Supermajority Vote": policy.supermajority_percent,
                "Treasury Allocation": policy.treasury_allocated_eth,
                "Allocation %": policy.treasury_percentage,
                "Impact Score": impact_score, 
                "Executors": len(policy.executors)
            })
        
        # Return a pandas DataFrame for structured data compatibility
        return pd.DataFrame(data)

    def generate_ecosystem_health(self):
        """Generates overall ecosystem health metrics."""
        return {
            "overall_coherence": self.simulated_impact["ecosystem_coherence"],
            "policy_adoption_rate": self.simulated_impact["policy_adoption_rate"],
            "community_growth": self.simulated_impact["community_growth_rate"],
            "treasury_utilization": self.simulated_impact["total_treasury_allocated"] / 10000.0,
            "voter_participation": self.simulated_impact["voter_participation"],
            "fragment_diversity": self.simulated_impact["fragment_diversity"]
        }
        
    # --- Rendering and Output ---

    def render_dashboard(self):
        """Prints the full Canticle Analytics Dashboard."""
        
        funnel = self.generate_onboarding_funnel()
        comparison = self.generate_policy_comparison()
        health = self.generate_ecosystem_health()

        print("\n🌒 CANTICLE ANALYTICS DASHBOARD")
        print("============================================================")

        print("\n📊 ONBOARDING FUNNEL")
        print(f"   Total Invited: {funnel['total_invited']}")
        print(f"   Onboarded: {funnel['onboarded']}")
        print(f"   Active Weavers: {funnel['active_weavers']}")
        print(f"   Climate Champions: {funnel['climate_champions']}")
        print(f"   Onboarding Rate: {funnel['onboarding_rate']:.1%}")
        print(f"   Avg Weaver Coherence: {funnel['avg_coherence']:.1%}")
        print(f"   Total Voting Power: {funnel['total_voting_power']:,} quanta")

        print("\n🏛️  POLICY PERFORMANCE")
        # Manually formatting the table output to match the user's expected visual
        print("          Policy Coherence Index Supermajority Vote Treasury Allocation Allocation %  Impact Score  Executors")
        
        for index, row in comparison.iterrows():
            policy_name = row['Policy'].ljust(15)
            coherence = f"{row['Coherence Index'] * 100:.1f}%".rjust(10)
            supermajority = f"{row['Supermajority Vote']:.1f}%".rjust(18)
            treasury = f"{row['Treasury Allocation']:,} ETH".rjust(20)
            allocation_pct = f"{row['Allocation %']:.1f}%".rjust(14)
            impact = f"{row['Impact Score']:.1f}".rjust(15)
            executors = str(row['Executors']).rjust(11)
            
            print(f"{index:2} {policy_name} {coherence} {supermajority} {treasury} {allocation_pct} {impact} {executors}")


        print("\n💫 POLICY IMPACT")
        for policy in self.policy_paths:
            print(f"\n   {policy.name}:")
            for metric, value in policy.impact_metrics.items():
                print(f"     • {metric}: {value}")
        
        print("\n❤️  ECOSYSTEM HEALTH")
        print(f"   Overall Coherence: {health['overall_coherence']:.1%}")
        print(f"   Policy Adoption Rate: {health['policy_adoption_rate']:.1%}")
        print(f"   Community Growth: {health['community_growth']:.1%}")
        print(f"   Treasury Utilization: {health['treasury_utilization']:.1%}")
        print(f"   Voter Participation: {health['voter_participation']:.1%}")
        print(f"   Fragment Diversity: {health['fragment_diversity']:.1%}")

        print("\n👥 WEAVER CONTRIBUTIONS")
        for weaver in self.weavers:
            status_text = f"({weaver.status.upper()})" if weaver.status != "active" else ""
            print(f"   @{weaver.handle}: {weaver.fragments_submitted} fragments, {weaver.estimated_coherence:.1%} avg coherence, {weaver.estimated_power:,} quanta {status_text}".strip())

        return self


# --- Entry Point for Testing ---
if __name__ == "__main__":
    analytics = CanticleAnalytics()
    analytics.render_dashboard()
