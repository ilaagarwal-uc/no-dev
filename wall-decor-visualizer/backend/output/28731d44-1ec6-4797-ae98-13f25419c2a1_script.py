OUTPUT_PATH = '/tmp/28731d44-1ec6-4797-ae98-13f25419c2a1.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions:
    - Total Height: 9'
    - Total Width: 14'6" (7' left section + 7'6" right section)
    - Opening (Left): 7' wide by 8' high
    - Top Header: 1' high above the opening
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (1 unit = 1 foot)
    wall_thickness = 0.5
    total_height = 9.0
    opening_width = 7.0
    opening_height = 8.0
    right_wall_width = 7.5  # 7'6"
    total_width = opening_width + right_wall_width # 14.5'

    # 1. Create the Top Header/Beam
    # This spans the entire width (14.5') and fills the top 1' gap
    # Dimensions: Width=14.5, Height=1.0, Depth=0.5
    # Center calculation: 
    # X: total_width / 2 = 7.25
    # Y: wall_thickness / 2 = 0.25
    # Z: opening_height + (header_height / 2) = 8.0 + 0.5 = 8.5
    bpy.ops.mesh.primitive_cube_add(size=1)
    top_beam = bpy.context.active_object
    top_beam.name = "Wall_Top_Header"
    top_beam.dimensions = (total_width, wall_thickness, 1.0)
    top_beam.location = (7.25, 0.25, 8.5)

    # 2. Create the Right Wall Section
    # This fills the space to the right of the opening
    # Dimensions: Width=7.5, Height=8.0, Depth=0.5
    # Center calculation:
    # X: opening_width + (right_wall_width / 2) = 7.0 + 3.75 = 10.75
    # Y: wall_thickness / 2 = 0.25
    # Z: opening_height / 2 = 4.0
    bpy.ops.mesh.primitive_cube_add(size=1)
    right_wall = bpy.context.active_object
    right_wall.name = "Wall_Right_Section"
    right_wall.dimensions = (right_wall_width, wall_thickness, opening_height)
    right_wall.location = (10.75, 0.25, 4.0)

    # Join the objects into a single mesh for the skeleton
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = top_beam
    bpy.ops.object.join()
    top_beam.name = "Wall_Skeleton"

    # Export to GLB format
    # use_selection=False ensures the entire scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/28731d44-1ec6-4797-ae98-13f25419c2a1.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()